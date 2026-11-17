# Kaggle CYRAN Worker Setup Guide

This guide details configuring and running the official **CYRAN** advanced reasoning model worker on Kaggle GPU runtimes, powered by **GPT-OSS 20B**.

## 1. Model Architecture & Platform Specifications
- **Public Model ID**: `cyran`
- **Actual Model**: **GPT-OSS 20B**
- **Hosting Platform**: Kaggle
- **Notebook**: `notebooks/cyran_kaggle.ipynb`
- **Worker ID**: `cyran-kaggle-1`
- **VRAM Requirements**: In 4-bit NF4 quantization (`BitsAndBytesConfig`), GPT-OSS 20B occupies ~11.5GB VRAM. It fits on Kaggle's **GPU T4 x 2 (30GB aggregate)** or **GPU P100 (16GB)** accelerators.

> [!IMPORTANT]
> The internal model architecture (**GPT-OSS 20B**) is strictly decoupled from the public API identifier (`cyran`). Customers interact exclusively with `model="cyran"`.

## 2. Obtain Worker Credentials
1. Navigate to AI VERSE Admin Console at `/admin/workers`.
2. Click **Add New Worker**:
   - Worker ID: `cyran-kaggle-1`
   - Model: `CYRAN`
   - Provider: `Kaggle`
3. Copy the generated secret token (`wtk_verse_...`).

## 3. Create Kaggle Notebook & Configure Secrets
1. Go to [Kaggle](https://www.kaggle.com) -> **Create** -> **New Notebook**.
2. File -> **Import Notebook** -> Upload `notebooks/cyran_kaggle.ipynb`.
3. In the right settings panel:
   - Accelerator: Select **GPU T4 x 2** or **GPU P100**.
   - Internet: Ensure **Internet on** is toggled ON.
4. Add Secrets via Kaggle UI:
   - Click **Add-ons** in the top menu -> **Secrets**.
   - Add `AI_VERSE_API_URL` -> Value: `https://your-api-gateway-url.com`.
   - Add `CYRAN_WORKER_TOKEN` -> Value: `wtk_verse_...`.
   - (Optional) Add `HF_TOKEN` -> Your Hugging Face token.

## 4. Launch Worker
1. Run all cells in the notebook.
2. The notebook verifies hardware compatibility (> 12GB VRAM aggregate), loads GPT-OSS 20B in 4-bit NF4 precision, maps tensors across the available GPUs, and starts the daemon loop.
3. Once registered, `cyran-kaggle-1` begins pulling high-priority reasoning requests dispatched from the AI VERSE queue.
