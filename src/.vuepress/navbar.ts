import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  "/demo/",
  {
    text: "分类",
    icon: "pen-to-square",
    prefix: "/posts/",
    children: [
      {
        text: "C++",
        icon: "pen-to-square",
        prefix: "c/",
        children: [
          { text: "基础", icon: "pen-to-square", link: "1" },
          { text: "高级", icon: "pen-to-square", link: "2" },
        ],
      },
      {
        text: "Golang",
        icon: "pen-to-square",
        prefix: "golang/",
        children: [
          {
            text: "基础",
            icon: "pen-to-square",
            link: "1",
          },
          {
            text: "高级特性-原理",
            icon: "pen-to-square",
            link: "2",
          },
        ],
      },
      { text: "Python", icon: "pen-to-square", link: "cherry" },
      { text: "Lua", icon: "pen-to-square", link: "dragonfruit" },
    ],
  },
]);
