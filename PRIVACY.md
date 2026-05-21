# Privacy Notes

This repository is intended to be a clean public template.

Do not commit:

- Target journal paper PDFs or Word files.
- Reference papers or citation libraries.
- Manuscript drafts.
- Simulation, experiment, measurement, or survey data.
- Reviewer, advisor, or collaborator comments.
- `03_Knowledge_Base`, `04_Task_Records`, or `06_Outputs` contents beyond `.gitkeep`.
- Dated Jarvis task folders.
- API keys, tokens, passwords, cookies, account names, private emails, or local chat files.

Before publishing updates, run a local scan such as:

```powershell
rg -n --hidden --glob '!.git/**' "D:\\|C:\\|@|token|password|secret|api[_-]?key|Authorization|Bearer|微信|wxid_|聊天文件" .
```

The template uses placeholders such as `{{PROJECT_ROOT}}`. Replace them only inside private project copies, not in the public template repository.
