import os
from django.conf import settings
import pandas as pd
from sklearn.model_selection import train_test_split
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import GPT4AllEmbeddings
# from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.docstore.document import Document
from tqdm import tqdm
import numpy as np
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Runs the job recommender system evaluation script.'

    def handle(self, *args, **options):
        """
        Hàm hoàn chỉnh để đánh giá hệ thống gợi ý việc làm.
        """
        # --- 1. CHUẨN BỊ DỮ LIỆU ---
        self.stdout.write("Bước 1: Đang tải và chuẩn bị dữ liệu...")

        csv_path = os.path.join(settings.BASE_DIR, "csvs/job_applicant_dataset.csv")

        try:
            df = pd.read_csv(csv_path)
        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"Lỗi: Không tìm thấy file tại đường dẫn: {csv_path}"))
            return

        # Xử lý các giá trị thiếu và trùng lặp
        df = df.dropna(subset=['Resume', 'Job Roles', 'Job Description'])
        df = df.drop_duplicates(subset=['Resume'])

        # a. Dữ liệu ứng viên để chia train/test
        applicants_df = df[['Resume', 'Job Roles']].copy()

        # b. Kho tri thức về các công việc để xây dựng index
        jobs_corpus_df = df[['Job Roles', 'Job Description']].drop_duplicates(subset=['Job Roles']).reset_index(drop=True)

        self.stdout.write(f"Đã xử lý xong. Có {len(applicants_df)} ứng viên và {len(jobs_corpus_df)} công việc duy nhất.")

        # --- 2. CHIA DỮ LIỆU (Giống trong machinelearning.py) ---
        self.stdout.write("\nBước 2: Đang chia dữ liệu thành tập train và test...")
        train_applicants, test_applicants = train_test_split(
            applicants_df,
            test_size=0.2,  # 20% dữ liệu dùng để kiểm thử
            random_state=42
        )
        self.stdout.write(f"Tập Train có {len(train_applicants)} ứng viên. Tập Test có {len(test_applicants)} ứng viên.")

        # --- 3. "HUẤN LUYỆN" (Xây dựng Vector Index) ---
        self.stdout.write("\nBước 3: Đang xây dựng index từ mô tả công việc...")
        documents = [
            Document(
                page_content=row['Job Description'],
                metadata={'job_role': row['Job Roles']}
            ) for _, row in jobs_corpus_df.iterrows()
        ]

        model_path = os.path.join(settings.BASE_DIR, "models/all-MiniLM-L6-v2-f16.gguf")
        embedding_model = GPT4AllEmbeddings(model_file=model_path)
        vector_db = FAISS.from_documents(documents, embedding_model)
        self.stdout.write("Xây dựng index thành công!")

        # Loi co gang tim kiem cac thu vien cuda la muon chay tren gpu nhung toi chay cpu nen van chay duoc

        # --- 4. "KIỂM THỬ" (Đưa ra gợi ý cho tập Test) ---
        self.stdout.write("\nBước 4: Đang thực hiện gợi ý trên tập test...")
        results = []
        K = 10  # Lấy top 10 gợi ý

        for _, row in tqdm(test_applicants.iterrows(), total=len(test_applicants)):
            cv_text = row['Resume']
            ground_truth_job = row['Job Roles']

            similar_docs = vector_db.similarity_search(cv_text, k=K)
            recommendations = [doc.metadata['job_role'] for doc in similar_docs]

            results.append({
                'ground_truth': ground_truth_job,
                'recommendations': recommendations
            })

        # --- 5. ĐÁNH GIÁ HIỆU SUẤT ---
        self.stdout.write("\nBước 5: Đang tính toán các chỉ số hiệu suất...")
        hits = 0
        reciprocal_ranks = []
        for result in results:
            ground_truth = result['ground_truth']
            recommendations = result['recommendations']

            if ground_truth in recommendations:
                hits += 1
                rank = recommendations.index(ground_truth) + 1
                reciprocal_ranks.append(1 / rank)
            else:
                reciprocal_ranks.append(0)

        hit_rate_at_k = hits / len(test_applicants) if test_applicants.shape[0] > 0 else 0
        mean_reciprocal_rank = np.mean(reciprocal_ranks) if reciprocal_ranks else 0

        self.stdout.write(self.style.SUCCESS("\n--- KẾT QUẢ ĐÁNH GIÁ ---"))
        self.stdout.write(f"Số ứng viên trong tập test: {len(test_applicants)}")
        self.stdout.write(f"Số gợi ý cho mỗi ứng viên (K): {K}")
        self.stdout.write("---------------------------------")
        self.stdout.write(f"Hit Rate @{K}: {hit_rate_at_k:.2%}")
        self.stdout.write("(Tỷ lệ phần trăm hệ thống gợi ý ĐÚNG công việc mà ứng viên đã ứng tuyển trong top {K})")
        self.stdout.write("\n")
        self.stdout.write(f"Mean Reciprocal Rank (MRR): {mean_reciprocal_rank:.4f}")
        self.stdout.write(
            "(Chỉ số đánh giá chất lượng xếp hạng. Càng gần 1.0 càng tốt, cho thấy công việc đúng được xếp hạng cao)")
        self.stdout.write("---------------------------------")
