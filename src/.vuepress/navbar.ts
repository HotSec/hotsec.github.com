import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  "/notebook/",
  {
    text: "分类",
    icon: "pen-to-square",
    prefix: "/posts/",
    children: [
      {
        text: "C++",
        icon: "pen-to-square",
        link: "/notebook/cpp/",
      },
      {
        text: "Golang",
        icon: "pen-to-square",
        prefix: "golang/",
        children: [
          {
            text: "基础",
            icon: "pen-to-square",
            link: "/notebook/go/1_语言基础/",
          },
          {
            text: "高级特性-原理",
            icon: "pen-to-square",
            link: "/notebook/go/2_高级特性-原理/",
          },
        ],
      },
      { text: "Python", icon: "pen-to-square", link: "/notebook/python/" },
      { text: "Lua", icon: "pen-to-square", link: "/notebook/lua/" },
    ],
  },
]);
