import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "小明的笔记本",
  description: "这是小明的笔记本",

  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
