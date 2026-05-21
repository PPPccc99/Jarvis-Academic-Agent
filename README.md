# Jarvis Academic Agent

贾维斯是一个面向高水平学术期刊正刊论文写作的 Codex 多智能体工作台。它通过主控智能体调度 15 个子智能体，辅助完成研究领域识别、目标期刊拆解、参考文献拆解、选题与创新点、任务书、正文写作、仿真/实验计划、结果分析、图表组织、语言润色、投稿检查和审稿人模拟。

本仓库是可分享的干净模板，不包含任何用户论文、参考文献、实验数据、知识库拆解结果或任务输出。

## 包含内容

```text
AGENTS.md
AI_Agent/
  00_System
  01_Agents
  02_Workflows
  03_Knowledge_Base/.gitkeep
  04_Task_Records/.gitkeep
  05_Templates
  06_Outputs/.gitkeep
  07_Dashboard
install.ps1
```

## 不包含内容

```text
目标期刊论文原文
参考文献原文
用户论文草稿
实验/仿真数据
目标期刊拆解结果
参考文献拆解结果
任务记录
阶段输出
本地 dashboard_server.pid
```

## 安装方式

1. 将本仓库复制或克隆到你的 Codex 项目根目录。
2. 在 PowerShell 中进入仓库目录。
3. 运行：

```powershell
.\install.ps1 -ProjectRoot "D:\你的项目路径"
```

安装脚本会把模板中的 `{{PROJECT_ROOT}}` 和 `{{PROJECT_ROOT_POSIX}}` 替换成你的真实项目路径。

## 使用方式

在 Codex 新对话中说：

```text
召唤贾维斯
```

贾维斯会：

1. 读取本项目 `AGENTS.md` 和 `AI_Agent` 配置。
2. 创建本轮专用工作文件夹。
3. 打开可视化工作台。
4. 一次性询问研究领域、论文类型、目标期刊、目标期刊论文文件夹、参考文献文件夹、当前进度和可用材料。
5. 建立领域画像和材料缺口清单。
6. 按最小调用原则调度必要子智能体参与论文分析、写作或审查。

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 注意

- 不要把自己的论文原文、参考文献、实验数据或任务输出提交到公开仓库。
- 若要跨项目同步贾维斯，默认只同步通用规则、智能体配置、工作流、模板和仪表盘代码。
- 不同步 `03_Knowledge_Base`、`04_Task_Records`、`06_Outputs`、本轮任务文件夹和仪表盘运行状态。
- 公开发布前建议运行隐私检查，确认没有本地路径、邮箱、API key、论文资料或实验数据。

## 隐私检查建议

```powershell
rg -n --hidden --glob '!.git/**' "D:\\|C:\\|@|token|password|secret|api[_-]?key|Authorization|Bearer|微信|wxid_|聊天文件" .
```

若命中的是示例路径或隐私规则说明，可以保留；若命中真实路径、账号、密钥或论文材料，应先删除再提交。
