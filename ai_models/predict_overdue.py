import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# 1. 예시 데이터셋 생성
# 가상의 사용자 납입 이력 데이터
# features:
#   - total_contributions: 총 납입 횟수
#   - missed_payments: 놓친 납입 횟수
#   - payment_consistency: 납입 일관성 (높을수록 좋음)
#   - kye_duration_months: 곗돈 기간 (개월)
# target:
#   - is_overdue: 연체 여부 (1: 연체, 0: 정상)

np.random.seed(42)
num_samples = 100

data = {
    'total_contributions': np.random.randint(5, 30, num_samples),
    'missed_payments': np.random.randint(0, 3, num_samples),
    'payment_consistency': np.random.rand(num_samples) * 10, # 0-10
    'kye_duration_months': np.random.randint(12, 60, num_samples),
}

df = pd.DataFrame(data)

# 연체 여부 (is_overdue) 생성 로직
# 놓친 납입 횟수가 많거나, 납입 일관성이 낮으면 연체될 확률이 높다고 가정
df['is_overdue'] = ((df['missed_payments'] > 0) & (df['payment_consistency'] < 5)).astype(int)
# 일부러 연체 비율을 조정하여 데이터 불균형을 만듦
df.loc[df['missed_payments'] > 1, 'is_overdue'] = 1
df.loc[df['payment_consistency'] < 3, 'is_overdue'] = 1

# 2. 데이터 분리 (훈련 세트와 테스트 세트)
X = df[['total_contributions', 'missed_payments', 'payment_consistency', 'kye_duration_months']]
y = df['is_overdue']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. 모델 학습 (Logistic Regression)
model = LogisticRegression(random_state=42)
model.fit(X_train, y_train)

# 4. 모델 평가
y_pred = model.predict(X_test)
print("\nModel Evaluation:")
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")
print("Classification Report:")
print(classification_report(y_test, y_pred))

# 5. 예측 함수
def predict_overdue_status(total_contributions, missed_payments, payment_consistency, kye_duration_months):
    """
    주어진 사용자 납입 이력 데이터를 기반으로 연체 가능성을 예측합니다.
    :param total_contributions: 총 납입 횟수
    :param missed_payments: 놓친 납입 횟수
    :param payment_consistency: 납입 일관성 (0-10, 높을수록 좋음)
    :param kye_duration_months: 곗돈 기간 (개월)
    :return: 연체 가능성 (0: 정상, 1: 연체)
    """
    input_data = pd.DataFrame([{
        'total_contributions': total_contributions,
        'missed_payments': missed_payments,
        'payment_consistency': payment_consistency,
        'kye_duration_months': kye_duration_months,
    }])
    prediction = model.predict(input_data)
    return prediction[0]

# 6. 예측 예시
print("\nPrediction Examples:")
# 정상으로 예측될 가능성이 높은 경우
example1 = predict_overdue_status(20, 0, 8.5, 36)
print(f"Example 1 (20 contributions, 0 missed, 8.5 consistency, 36 months): {example1} (0=Normal, 1=Overdue)")

# 연체로 예측될 가능성이 높은 경우
example2 = predict_overdue_status(10, 2, 2.1, 24)
print(f"Example 2 (10 contributions, 2 missed, 2.1 consistency, 24 months): {example2} (0=Normal, 1=Overdue)")

# 경계선에 있는 경우
example3 = predict_overdue_status(15, 1, 5.0, 48)
print(f"Example 3 (15 contributions, 1 missed, 5.0 consistency, 48 months): {example3} (0=Normal, 1=Overdue)")
