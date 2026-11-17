# Google Colab CYRUS Worker Setup Guide

This guide details configuring and running the official **CYRUS** model worker on Google Colab, powered by **Gemma 4 E4B**.

## 1. Model Architecture & Platform Specifications
- **Public Model ID**: `cyrus`
- **Actual Model**: **Gemma 4 E4B**
- **Hosting Platform**: Google Colab
- **Notebook**: `notebooks/cyrus_colab.ipynb`
- **Worker ID**: `cyrus-colab-1`
- **VRAM Requirements**: ~8GB VRAM in FP16/BF16, or ~3.5GB in 4-bit. Readily compatible with Google Colab's standard free **Tesla T4 (15.8GB)** or **A100/L4** GPUs.

> [!IMPORTANT]
> The internal model architecture (**Gemma 4 E4B**) is strictly decoupled from the public API identifier (`cyrus`). Customers interact exclusively with `model="cyrus"`.

## 2. Obtain Worker Credentials
1. Sign in to your AI VERSE Admin Console at `/admin`.
2. Navigate to **Worker Fleet** (`/admin/workers`).
3. Click **Add New Worker**:
   - Worker ID: `cyrus-colab-1`
   - Assigned Model: `CYRUS`
   - Provider: `Google Colab`
4. Copy the generated secret token (starts with `wtk_verse_...`).

## 3. Configure Colab Secrets
1. Open `notebooks/cyrus_colab.ipynb` in [Google Colab](https://colab.research.google.com).
2. Set the runtime hardware accelerator to **T4 GPU** (or A100 / L4 if available):
   - Navigate to `Runtime` -> `Change runtime type` -> select `T4 GPU`.
3. In the left sidebar of Colab, click the **Key icon** (Secrets):
   - Add Secret: `AI_VERSE_API_URL` -> Value: `https://your-api-gateway-url.com`
   - Add Secret: `CYRUS_WORKER_TOKEN` -> Value: `wtk_verse_...`
   - (Optional) Add Secret: `HF_TOKEN` -> Your Hugging Face user token (required if accessing gated Gemma model checkpoints).
   - Enable "Notebook access" for all keys.

## 4. Run the Worker
1. Execute the cells sequentially:
   - System Diagnostics (verifies CUDA availability and confirms > 7GB VRAM)
   - Dependency Installation
   - Load Secrets
   - Model Loading (loads Gemma 4 E4B weights)
   - Worker Daemon Execution
2. The notebook will register `cyrus-colab-1`, start sending heartbeats every 15s, and poll for incoming `CYRUS` requests.
3. Verify in your AI VERSE Admin Dashboard that `cyrus-colab-1` transitions to `online`.
