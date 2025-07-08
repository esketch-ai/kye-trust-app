import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from google.cloud import storage

# 1. Google Cloud Storage에서 CSV 파일 읽기
def load_csv_from_gcs(bucket_name, file_name):
    """
    Google Cloud Storage에서 CSV 파일을 읽어 Pandas DataFrame으로 반환합니다.
    :param bucket_name: GCS 버킷 이름
    :param file_name: GCS 버킷 내의 파일 경로 (예: 'data/my_data.csv')
    :return: Pandas DataFrame
    """
    try:
        client = storage.Client() # GCS 클라이언트 초기화 (인증 필요)
        bucket = client.get_bucket(bucket_name)
        blob = bucket.blob(file_name)
        
        # Blob 내용을 문자열로 읽어와 pandas.read_csv로 처리
        data = blob.download_as_text()
        df = pd.read_csv(pd.io.common.StringIO(data))
        print(f"Successfully loaded {file_name} from GCS bucket {bucket_name}.")
        return df
    except Exception as e:
        print(f"Error loading CSV from GCS: {e}")
        return None

# 2. 데이터 전처리 함수
def preprocess_data(df):
    """
    데이터프레임에 대한 기본적인 전처리를 수행합니다.
    - 결측치 처리 (수치형: 평균으로 대체, 범주형: 최빈값으로 대체)
    - 수치형 데이터 정규화 (Min-Max Scaling)
    :param df: 전처리할 Pandas DataFrame
    :return: 전처리된 Pandas DataFrame
    """
    if df is None: # 데이터프레임이 None인 경우 처리
        return None

    df_processed = df.copy()

    # 결측치 처리
    for column in df_processed.columns:
        if df_processed[column].dtype in ['int64', 'float64']:
            # 수치형 데이터는 평균으로 대체
            if df_processed[column].isnull().any():
                mean_val = df_processed[column].mean()
                df_processed[column].fillna(mean_val, inplace=True)
                print(f"Filled missing values in column '{column}' with mean: {mean_val:.2f}")
        else:
            # 범주형 데이터는 최빈값으로 대체
            if df_processed[column].isnull().any():
                mode_val = df_processed[column].mode()[0]
                df_processed[column].fillna(mode_val, inplace=True)
                print(f"Filled missing values in column '{column}' with mode: {mode_val}")

    # 수치형 데이터 정규화 (Min-Max Scaling)
    scaler = MinMaxScaler()
    numeric_cols = df_processed.select_dtypes(include=np.number).columns
    if not numeric_cols.empty:
        df_processed[numeric_cols] = scaler.fit_transform(df_processed[numeric_cols])
        print(f"Normalized numeric columns: {list(numeric_cols)}")
    else:
        print("No numeric columns found for normalization.")

    print("Data preprocessing complete.")
    return df_processed

# 3. 예시 사용법
if __name__ == "__main__":
    # 실제 GCS 버킷 이름과 파일 경로로 변경해야 합니다.
    # 테스트를 위해 가상의 버킷과 파일 이름을 사용합니다.
    # 이 코드를 실행하기 전에 `gcloud auth application-default login`을 실행해야 합니다.
    
    # 가상의 CSV 데이터 생성 (GCS에 업로드되어 있다고 가정)
    # 실제 사용 시에는 이 부분은 필요 없습니다.
    sample_data = {
        'feature1': [10, 20, np.nan, 40, 50],
        'feature2': [1.1, 2.2, 3.3, np.nan, 5.5],
        'category': ['A', 'B', 'A', 'C', np.nan],
        'target': [0, 1, 0, 1, 0]
    }
    sample_df = pd.DataFrame(sample_data)
    sample_df.to_csv("sample_data.csv", index=False) # 로컬에 임시 저장
    print("Created sample_data.csv locally for demonstration.")

    # GCS에 업로드하는 과정은 이 스크립트 범위 밖입니다.
    # 실제 사용 시에는 GCS에 파일이 미리 업로드되어 있어야 합니다.

    # 예시 GCS 버킷 및 파일 이름 (실제 사용 시 변경)
    GCS_BUCKET_NAME = "your-gcs-bucket-name" # 실제 버킷 이름으로 변경
    GCS_FILE_NAME = "sample_data.csv" # 실제 파일 이름으로 변경

    # GCS에서 데이터 로드
    my_df = load_csv_from_gcs(GCS_BUCKET_NAME, GCS_FILE_NAME)

    if my_df is not None:
        print("\nOriginal DataFrame Head:")
        print(my_df.head())

        # 데이터 전처리
        processed_df = preprocess_data(my_df)

        if processed_df is not None:
            print("\nProcessed DataFrame Head:")
            print(processed_df.head())
            print("\nProcessed DataFrame Info:")
            processed_df.info()
