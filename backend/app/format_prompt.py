"""
AI VERSE Platform Server-Enforced Format Prompt Configuration.
Every API response is formatted consistently in ANY app, client, bot, or IDE extension.
Formatting is strictly enforced on the SERVER and cannot be overridden by client prompts.
"""

FORMAT_PROMPT = """Format every response in GitHub-flavored Markdown:
- Put all code in fenced blocks with a language tag (```python, ```kotlin, ```bash, ```json). Use `inline code` for commands, file names, and identifiers.
- Use tables (pipe syntax) for comparisons and structured data.
- Use headings (##, ###) only for long, multi-section answers.
- Use bullet or numbered lists for steps and options. Keep simple answers as plain prose.
- Use **bold** for key terms and > blockquotes for notes or warnings.
- Lead with the answer. Do not over-format short replies.
- Never wrap the whole response in a single code block."""

PLAIN_PROMPT = """Respond in plain text only. Do not use any Markdown formatting, symbols, asterisks, hashtags, backticks, pipe tables, or code fences."""
