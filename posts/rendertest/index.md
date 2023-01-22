---
title: "测试 Markdown 渲染效果" # 此处中英文混排需要手动加空格，正文使用vscode自动加空格所以不用手动
ctime: "2023-01-20T06:35:27.956Z"
# mtime: "2023-01-15T09:02:51.147Z"
description: "包括CommonMark、GFM、代码高亮、iframe 等"
category: "杂项"
tags: ["markdown", "测试"]
---

# 测试 Markdown 渲染效果

## 行内元素

包括**粗体（bold）**、_斜体（italic）_、`行内代码块`、[链接](#)

## 块级元素

### 标题

#### 四级标题

避免使用五级和六级标题

### 段落

Rust 程序设计语言的本质实际在于**赋能**（_empowerment_）：无论你现在编写的是何种代码，Rust 能让你在更为广泛的编程领域走得更远，写出自信。（这一点并不显而易见）

举例来说，那些“系统层面”的工作涉及内存管理、数据表示和并发等底层细节。从传统角度来看，这是一个神秘的编程领域，只为浸润多年的极少数人所触及，也只有他们能避开那些臭名昭著的陷阱。即使谨慎的实践者，亦唯恐代码出现漏洞、崩溃或损坏。

Rust 破除了这些障碍：它消除了旧的陷阱，并提供了伴你一路同行的友好、精良的工具。想要 “深入” 底层控制的程序员可以使用 Rust，无需时刻担心出现崩溃或安全漏洞，也无需因为工具链不靠谱而被迫去了解其中的细节。更妙的是，语言设计本身会自然而然地引导你编写出可靠的代码，并且运行速度和内存使用上都十分高效。

（摘自[《Rust 程序设计语言 简体中文版》](https://kaisery.github.io/trpl-zh-cn/foreword.html)

### 图片

`<img>`本来是行内元素，但是 tailwindcss 把它重设成了 block

![some image](./assets/reacticon.ico)

（Create React App 项目的默认图标）

### 引用

> When analysing whether a license is free or not, you usually check that it allows free usage, modification and redistribution. Then you check that the additional restrictions do not impair fundamental freedoms. The WTFPL renders this task trivial: it allows everything and has no additional restrictions. How could life be easier? You just DO WHAT THE FUCK YOU WANT TO.

（摘自 [WTFPL 官网](http://www.wtfpl.net/about/)）

### 有序列表

1. 安装前的准备
   1. 下载镜像
   2. 验证签名
   3. 准备安装介质
   4. 启动到安装环境
2. 安装
   1. 选择镜像源
   2. 安装必要的软件包
3. 配置
   1. fstab
   2. chroot
   3. 时区

### 无序列表

- Windows
  - 10
  - 11
- MacOS X
- Linux
  - Ubuntu
    - 22.04
  - Arch

### 分割线

---

## GitHub Flavored Markdown (GFM)

### 删除线

~~删除线（strikethrough）~~

### 自动链接

自动链接（如 http://www.commonmark.org）

### 任务列表

- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

### 代码块

```
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
```

### 表格

| Syntax    | Description |
| --------- | ----------- |
| Header    | Title       |
| Paragraph | Text        |

## 其他

### 代码块语法高亮

```typescript
const FancyThing: React.FC = () => {
  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-between">
      <div>i am a fancy thing</div>
      <div>i am another fancy thing</div>
      <div>i am also a fancy thing</div>
    </div>
  );
};
```

### iframe

用来放示例代码

<iframe src="./fuc.html"></iframe>
