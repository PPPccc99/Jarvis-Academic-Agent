# 贾维斯多智能体可视化仪表盘

本目录提供一个本地网页，用于查看“贾维斯”15 个论文写作智能体的状态、当前调用链、最近事件和阶段目标。

默认约定：用户说出“召唤贾维斯”后，Codex 应启动本项目多智能体体系，并默认打开该可视化仪表盘。

页面顶部包含“后台智能体”小队面板，每个智能体都有独立颜色和小图标。凡是出现在 `active_chain` 中，或状态为 `active` 的智能体，都会在名称后显示“（努力工作中）”。

## 文件

```text
index.html             仪表盘页面
style.css              页面样式
dashboard.js           读取状态并渲染页面
agent_status.json      智能体运行状态
update_agent_status.py 状态更新脚本
```

## 使用方式

推荐用本地服务器打开，否则浏览器可能阻止页面读取 `agent_status.json`。

```powershell
cd {{PROJECT_ROOT}}\AI_Agent\07_Dashboard
python -m http.server 8765
```

然后访问：

```text
http://127.0.0.1:8765/index.html
```

也可以直接运行：

```powershell
{{PROJECT_ROOT}}\AI_Agent\07_Dashboard\start_dashboard.ps1
```

停止仪表盘服务：

```powershell
{{PROJECT_ROOT}}\AI_Agent\07_Dashboard\stop_dashboard.ps1
```

## 更新状态示例

把目标期刊论文拆解智能体设为工作中：

```powershell
python update_agent_status.py --agent 03 --status active --task "拆解用户指定目标期刊近期论文" --called-by 01 --chain 01,03 --stage "目标期刊拆解" --goal "建立目标期刊写法规律知识库" --next "完成后交给证据库管理智能体归档"
```

将其标记为完成，并让证据库管理智能体开始工作：

```powershell
python update_agent_status.py --agent 03 --status done --task "目标期刊论文拆解完成" --event "目标期刊拆解结果已生成。"
python update_agent_status.py --agent 05 --status active --task "归档目标期刊拆解结果" --called-by 01 --chain 01,03,05
```

重置全部状态：

```powershell
python update_agent_status.py --reset
```

## 状态含义

```text
active   工作中
waiting  等待其他智能体或用户信息
blocked  阻塞，需要用户或数据解决
done     当前阶段完成
idle     空闲
```

后续主控智能体执行任务时，可以先调用 `update_agent_status.py` 更新页面状态，再执行对应子智能体任务。
