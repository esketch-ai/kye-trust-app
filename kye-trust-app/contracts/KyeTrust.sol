// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KyeTrust {
    address public owner;
    string public name;
    uint256 public goalAmount;
    uint256 public contributionAmount;
    uint256 public duration; // in months
    uint256 public currentTurn;
    uint256 public pot;

    address[] public members;
    mapping(address => bool) public isMember;
    mapping(uint256 => mapping(address => bool)) public hasPaid;
    mapping(address => uint256) public lastPaidTurn; // New: Track last paid turn for each member

    enum State { Created, Active, Closed }
    State public state;

    // Multi-signature variables
    bool public multiSigEnabled;
    uint256 public requiredConfirmations;
    mapping(bytes32 => mapping(address => bool)) public confirmations;
    mapping(bytes32 => uint256) public confirmationCount;

    // Action identifiers for multi-sig
    bytes32 private constant ACTION_START_KYE = keccak256("START_KYE");
    bytes32 private constant ACTION_PAYOUT_KYE = keccak256("PAYOUT_KYE");

    // RBAC variables
    enum Role { None, Member, Treasurer, Admin }
    mapping(address => Role) public memberRoles;

    // Events
    event KyeStarted();
    event ContributionReceived(address indexed member, uint256 turn, uint256 amount);
    event PayoutMade(address indexed recipient, uint256 turn, uint256 amount);
    event PenaltyApplied(address indexed member, uint256 turn, uint256 penaltyAmount);

    modifier onlyMember() {
        require(isMember[msg.sender], "Not a member");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyRole(Role _role) {
        require(memberRoles[msg.sender] == _role, "Unauthorized: Insufficient role");
        _;
    }

    constructor(
        string memory _name,
        uint256 _goalAmount,
        uint256 _contributionAmount,
        uint256 _duration,
        address[] memory _members,
        bool _multiSigEnabled,
        uint256 _requiredConfirmations
    ) {
        owner = msg.sender;
        name = _name;
        goalAmount = _goalAmount;
        contributionAmount = _contributionAmount;
        duration = _duration;
        currentTurn = 1;
        state = State.Created;

        multiSigEnabled = _multiSigEnabled;
        if (_multiSigEnabled) {
            require(
                _requiredConfirmations > 0 && _requiredConfirmations <= _members.length,
                "Invalid required confirmations"
            );
            requiredConfirmations = _requiredConfirmations;
        } else {
            requiredConfirmations = 1; // Default to 1 if multi-sig is not enabled
        }

        // Initialize roles and add members
        memberRoles[owner] = Role.Admin; // Owner is Admin by default
        for (uint i = 0; i < _members.length; i++) {
            require(!isMember[_members[i]], "Duplicate member");
            isMember[_members[i]] = true;
            members.push(_members[i]); // Add member to the array
            if (_members[i] != owner) {
                memberRoles[_members[i]] = Role.Member;
            }
            lastPaidTurn[_members[i]] = 0; // Initialize last paid turn
        }
    }

    function start() public onlyMember onlyRole(Role.Admin) {
        require(state == State.Created, "Already started");

        if (multiSigEnabled) {
            bytes32 actionHash = ACTION_START_KYE;
            require(confirmations[actionHash][msg.sender] == false, "Already confirmed");
            confirmations[actionHash][msg.sender] = true;
            confirmationCount[actionHash]++;
            require(
                confirmationCount[actionHash] >= requiredConfirmations,
                "Not enough confirmations"
            );
        }

        state = State.Active;
        emit KyeStarted();
    }

    function contribute() public payable onlyMember {
        require(state == State.Active, "Not active");
        require(msg.value == contributionAmount, "Incorrect contribution amount");
        require(!hasPaid[currentTurn][msg.sender], "Already paid for this turn");

        hasPaid[currentTurn][msg.sender] = true;
        lastPaidTurn[msg.sender] = currentTurn; // Update last paid turn
        pot += msg.value;

        emit ContributionReceived(msg.sender, currentTurn, msg.value);
    }

    function hasAllContributedForCurrentTurn() public view returns (bool) {
        for (uint i = 0; i < members.length; i++) {
            if (!hasPaid[currentTurn][members[i]]) {
                return false;
            }
        }
        return true;
    }

    function isOverdue(address _member) public view returns (bool) {
        // A member is overdue if they haven't paid for the current turn
        // and the current turn is greater than their last paid turn.
        // This is a simplified logic. More complex logic might involve deadlines.
        return (currentTurn > lastPaidTurn[_member] && !hasPaid[currentTurn][_member]);
    }

    function applyPenalty(address _member) public onlyRole(Role.Admin) {
        require(isMember[_member], "Member does not exist");
        require(isOverdue(_member), "Member is not overdue");

        // Simple penalty: require an additional contribution for the missed turn
        // In a real system, this might involve burning tokens, reducing trust score,
        // or distributing penalty to other members.
        // For now, we just record the penalty.
        uint256 penaltyAmount = contributionAmount / 10; // Example: 10% of contribution
        // This penalty amount would typically be paid by the overdue member
        // or deducted from their future payouts.

        emit PenaltyApplied(_member, currentTurn, penaltyAmount);
    }

    function payout() public onlyMember onlyRole(Role.Treasurer) {
        require(state == State.Active, "Not active");
        require(hasAllContributedForCurrentTurn(), "Not all members have contributed for this turn");
        require(msg.sender == members[currentTurn - 1], "Only current turn recipient can payout");

        if (multiSigEnabled) {
            bytes32 actionHash = ACTION_PAYOUT_KYE;
            require(confirmations[actionHash][msg.sender] == false, "Already confirmed");
            confirmations[actionHash][msg.sender] = true;
            confirmationCount[actionHash]++;
            require(
                confirmationCount[actionHash] >= requiredConfirmations,
                "Not enough confirmations"
            );
        }

        address payable recipient = payable(members[currentTurn - 1]);
        recipient.transfer(pot);

        emit PayoutMade(recipient, currentTurn, pot);

        pot = 0;
        currentTurn++;

        // Reset confirmations for the next payout action
        resetConfirmations(ACTION_PAYOUT_KYE);

        if (currentTurn > duration) {
            state = State.Closed;
        }
    }

    function getState() public view returns (string memory) {
        if (state == State.Created) {
            return "Created";
        } else if (state == State.Active) {
            return "Active";
        } else if (state == State.Closed) {
            return "Closed";
        } else {
            return "Unknown";
        }
    }

    // Function to get confirmation status for an action
    function getConfirmationStatus(bytes32 _actionHash) public view returns (uint256, bool) {
        return (confirmationCount[_actionHash], confirmationCount[_actionHash] >= requiredConfirmations);
    }

    // Function to reset confirmations for an action (e.g., after a successful action)
    function resetConfirmations(bytes32 _actionHash) internal {
        for (uint i = 0; i < members.length; i++) {
            confirmations[_actionHash][members[i]] = false;
        }
        confirmationCount[_actionHash] = 0;
    }

    // RBAC functions
    function getRole(address _member) public view returns (Role) {
        return memberRoles[_member];
    }

    function assignRole(address _member, Role _role) public onlyOwner {
        require(isMember[_member], "Member does not exist in this Kye");
        memberRoles[_member] = _role;
    }
}
