import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib # For saving/loading scikit-learn models

# Google Cloud Vertex AI SDK
from google.cloud import aiplatform

# --- 설정 (Google Cloud Project ID 및 Region) ---
PROJECT_ID = "your-gcp-project-id"  # 실제 GCP 프로젝트 ID로 변경
REGION = "us-central1"             # Vertex AI를 사용할 리전으로 변경 (예: asia-southeast1)

aiplatform.init(project=PROJECT_ID, location=REGION)

# 1. 데이터 준비 (예시: 이전 predict_overdue.py의 데이터셋 사용)
# 실제 시나리오에서는 GCS에서 전처리된 데이터를 로드합니다.
# from data_preprocessing import load_csv_from_gcs, preprocess_data

np.random.seed(42)
num_samples = 100

data = {
    'total_contributions': np.random.randint(5, 30, num_samples),
    'missed_payments': np.random.randint(0, 3, num_samples),
    'payment_consistency': np.random.rand(num_samples) * 10,
    'kye_duration_months': np.random.randint(12, 60, num_samples),
}

df = pd.DataFrame(data)
df['is_overdue'] = ((df['missed_payments'] > 0) & (df['payment_consistency'] < 5)).astype(int)
df.loc[df['missed_payments'] > 1, 'is_overdue'] = 1
df.loc[df['payment_consistency'] < 3, 'is_overdue'] = 1

X = df[['total_contributions', 'missed_payments', 'payment_consistency', 'kye_duration_months']]
y = df['is_overdue']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Data prepared for training.")

# 2. 모델 학습
print("Training Logistic Regression model...")
model = LogisticRegression(random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print(f"Model Accuracy: {accuracy_score(y_test, y_pred):.2f}")
print("Model training complete.")

# 3. 학습된 모델 저장
# Vertex AI에 업로드하기 위해 모델을 로컬 파일로 저장합니다.
MODEL_LOCAL_PATH = "overdue_prediction_model.joblib"
joblib.dump(model, MODEL_LOCAL_PATH)
print(f"Model saved locally to {MODEL_LOCAL_PATH}")

# 4. 모델을 Vertex AI Model Registry에 업로드
# 모델 업로드 시 필요한 정보:
#   - display_name: 모델 레지스트리에서 보여질 이름
#   - artifact_uri: 모델 파일이 저장될 GCS 경로 (gs://your-bucket/your-model-path/)
#   - serving_container_image_uri: 모델 서빙에 사용될 Docker 이미지 (scikit-learn용 미리 빌드된 이미지 사용)

# 모델을 저장할 GCS 버킷 경로 (실제 버킷 이름으로 변경)
# gs://your-bucket-name/models/overdue_prediction/
MODEL_GCS_PATH = f"gs://{PROJECT_ID}-vertex-ai-models/overdue_prediction/"

# 모델 파일을 GCS로 업로드
# Vertex AI SDK는 로컬 파일을 GCS로 자동 업로드하는 기능을 제공합니다.
# 또는 gsutil cp overdue_prediction_model.joblib gs://your-bucket-name/models/overdue_prediction/overdue_prediction_model.joblib

print(f"Uploading model to Vertex AI Model Registry from {MODEL_LOCAL_PATH}...")

# scikit-learn 모델을 위한 미리 빌드된 서빙 이미지
# https://cloud.google.com/vertex-ai/docs/predictions/pre-built-containers
SERVING_CONTAINER_IMAGE = "us-docker.pkg.dev/vertex-ai/prediction/sklearn-cpu.1-0:latest"

# Model Registry에 모델 업로드
# 이 과정은 시간이 다소 소요될 수 있습니다.
uploaded_model = aiplatform.Model.upload(
    display_name="Overdue_Prediction_Model",
    artifact_uri=MODEL_GCS_PATH,
    serving_container_image_uri=SERVING_CONTAINER_IMAGE,
    sync=True # 동기적으로 업로드 완료를 기다림
)

print(f"Model uploaded to Vertex AI Model Registry. Model ID: {uploaded_model.name}")
print(f"Model Resource Name: {uploaded_model.resource_name}")

# 5. (선택 사항) 모델 배포 (Endpoint 생성 및 배포)
# 모델을 배포하여 예측 요청을 받을 수 있는 엔드포인트를 생성합니다.
# 이 과정은 비용이 발생할 수 있으며, 실제 예측이 필요할 때 수행합니다.
# print("Deploying model to an endpoint...")
# endpoint = uploaded_model.deploy(
#     machine_type="n1-standard-2", # 예측에 사용할 머신 타입
#     min_replica_count=1,
#     max_replica_count=1,
#     sync=True
# )
# print(f"Model deployed to endpoint: {endpoint.display_name}")
# print(f"Endpoint Resource Name: {endpoint.resource_name}")

# 예측 요청 예시 (엔드포인트 배포 후)
# from google.cloud.aiplatform.gapic.schema import predict
# instance = predict.instance.PredictionInstance(instances=[[20, 0, 8.5, 36]])
# prediction = endpoint.predict(instances=[instance])
# print("Prediction from deployed model:", prediction)
