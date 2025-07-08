import pandas as pd
from google.cloud import aiplatform
from google.cloud.aiplatform.gapic.schema import predict

# --- 설정 (Google Cloud Project ID, Region, Model ID 또는 Endpoint ID) ---
PROJECT_ID = "your-gcp-project-id"  # 실제 GCP 프로젝트 ID로 변경
REGION = "us-central1"             # Vertex AI 모델이 배포된 리전으로 변경

# 모델 ID 또는 엔드포인트 ID 중 하나를 사용합니다.
# 모델 ID는 Model Registry에 등록된 모델의 ID입니다.
# 엔드포인트 ID는 모델이 배포되어 예측 요청을 받을 수 있는 엔드포인트의 ID입니다.
# 일반적으로 엔드포인트 ID를 사용하여 예측을 수행합니다.
MODEL_ID = "your-model-id"       # Vertex AI Model Registry의 모델 ID (예: "1234567890")
ENDPOINT_ID = "your-endpoint-id" # Vertex AI Endpoint의 ID (예: "9876543210")

# aiplatform.init(project=PROJECT_ID, location=REGION)

def predict_overdue_with_vertex_ai(
    total_contributions: int,
    missed_payments: int,
    payment_consistency: float,
    kye_duration_months: int,
    project: str = PROJECT_ID,
    location: str = REGION,
    endpoint_id: str = ENDPOINT_ID,
    model_id: str = MODEL_ID,
):
    """
    Vertex AI에 배포된 모델을 사용하여 연체 가능성을 예측합니다.
    :param total_contributions: 총 납입 횟수
    :param missed_payments: 놓친 납입 횟수
    :param payment_consistency: 납입 일관성 (0-10, 높을수록 좋음)
    :param kye_duration_months: 곗돈 기간 (개월)
    :param project: GCP 프로젝트 ID
    :param location: Vertex AI 리전
    :param endpoint_id: 배포된 모델 엔드포인트 ID
    :param model_id: 모델 레지스트리의 모델 ID (엔드포인트 ID가 없을 경우 사용)
    :return: 예측 결과 (예: 0 또는 1)
    """

    # 입력 데이터를 모델이 기대하는 형식으로 변환
    # scikit-learn 모델의 경우, 일반적으로 리스트 형태의 인스턴스를 기대합니다.
    instances = [
        [
            total_contributions,
            missed_payments,
            payment_consistency,
            kye_duration_months,
        ]
    ]

    # 엔드포인트 클라이언트 초기화
    client_options = {"api_endpoint": f"{location}-aiplatform.googleapis.com"}
    client = aiplatform.gapic.PredictionServiceClient(client_options=client_options)

    # 모델 엔드포인트 경로 설정
    if endpoint_id:
        endpoint = client.endpoint_path(project, location, endpoint_id)
    elif model_id:
        # 모델 ID만 있는 경우, 모델을 배포해야 예측 가능
        print("Warning: Model ID provided, but no Endpoint ID. "
              "Model must be deployed to an endpoint for predictions.")
        return None
    else:
        raise ValueError("Either endpoint_id or model_id must be provided.")

    # 예측 요청 생성
    # scikit-learn 모델은 PredictionInstance를 사용하지 않고 직접 리스트를 전달할 수 있습니다.
    # 하지만 gapic 스키마를 사용하면 더 명확합니다.
    # instances_proto = [predict.instance.PredictionInstance(instance) for instance in instances]
    # request = predict.PredictRequest(endpoint=endpoint, instances=instances_proto)

    # 직접 리스트를 전달하는 방식 (scikit-learn 컨테이너에 적합)
    response = client.predict(endpoint=endpoint, instances=instances)

    # 예측 결과 파싱
    # scikit-learn 모델의 예측 결과는 'predictions' 필드에 리스트 형태로 반환됩니다.
    # 예: [[0], [1]] 또는 [0, 1]
    predictions = response.predictions

    if predictions and len(predictions) > 0:
        # 예측 결과가 리스트 안에 리스트로 올 수 있으므로 첫 번째 요소를 추출
        return predictions[0][0] if isinstance(predictions[0], list) else predictions[0]
    return None

# --- 예시 사용법 ---
if __name__ == "__main__":
    # 이 코드를 실행하기 전에 Vertex AI에 모델이 배포되어 엔드포인트가 활성화되어 있어야 합니다.
    # PROJECT_ID, REGION, ENDPOINT_ID를 실제 값으로 변경하세요.

    print("\n--- Vertex AI Prediction Example ---")

    # 예측할 데이터
    test_data_normal = {
        "total_contributions": 25,
        "missed_payments": 0,
        "payment_consistency": 9.2,
        "kye_duration_months": 48,
    }

    test_data_overdue = {
        "total_contributions": 10,
        "missed_payments": 3,
        "payment_consistency": 2.5,
        "kye_duration_months": 24,
    }

    # 정상으로 예측될 것으로 예상되는 경우
    print("\nPredicting for a likely NORMAL case:")
    prediction_normal = predict_overdue_with_vertex_ai(
        **test_data_normal,
        project=PROJECT_ID, # 실제 GCP 프로젝트 ID
        location=REGION,    # 실제 Vertex AI 리전
        endpoint_id=ENDPOINT_ID # 실제 Vertex AI 엔드포인트 ID
    )
    if prediction_normal is not None:
        print(f"Prediction: {prediction_normal} (0=Normal, 1=Overdue)")

    # 연체로 예측될 것으로 예상되는 경우
    print("\nPredicting for a likely OVERDUE case:")
    prediction_overdue = predict_overdue_with_vertex_ai(
        **test_data_overdue,
        project=PROJECT_ID, # 실제 GCP 프로젝트 ID
        location=REGION,    # 실제 Vertex AI 리전
        endpoint_id=ENDPOINT_ID # 실제 Vertex AI 엔드포인트 ID
    )
    if prediction_overdue is not None:
        print(f"Prediction: {prediction_overdue} (0=Normal, 1=Overdue)")