(window.webpackJsonp=window.webpackJsonp||[]).push([[77],{483:function(a,s,n){"use strict";n.r(s);var e=n(56),t=Object(e.a)({},(function(){var a=this,s=a.$createElement,n=a._self._c||s;return n("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[n("h1",{attrs:{id:"terraform"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#terraform"}},[a._v("#")]),a._v(" terraform")]),a._v(" "),n("h2",{attrs:{id:"安装"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#安装"}},[a._v("#")]),a._v(" 安装")]),a._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[a._v("git")]),a._v(" clone https://github.com/hashicorp/terraform.git\n"),n("span",{pre:!0,attrs:{class:"token builtin class-name"}},[a._v("cd")]),a._v(" terraform\n"),n("span",{pre:!0,attrs:{class:"token function"}},[a._v("make")]),a._v("\n")])]),a._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[a._v("1")]),n("br"),n("span",{staticClass:"line-number"},[a._v("2")]),n("br"),n("span",{staticClass:"line-number"},[a._v("3")]),n("br")])]),n("h2",{attrs:{id:"常用命令"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#常用命令"}},[a._v("#")]),a._v(" 常用命令")]),a._v(" "),n("ul",[n("li",[a._v("terraform plan：资源的预览")]),a._v(" "),n("li",[a._v("terraform apply：资源的新建和变更\n"),n("ul",[n("li",[a._v("--auto-approve 跳过人工确认")])])]),a._v(" "),n("li",[a._v("terraform show：资源的展示")]),a._v(" "),n("li",[a._v("terraform destroy：资源的释放\n"),n("ul",[n("li",[a._v("--force 跳过二次确认")])])]),a._v(" "),n("li",[a._v("terraform import：资源的导入")]),a._v(" "),n("li",[a._v("terraform taint：标记资源为被污染\n"),n("ul",[n("li",[a._v("taint命令用于把某个资源标记为被污染状态，当再次执行apply命令时，这个被污染的资源将会被先释放，然后再创建一个新的，相当于对这个特定资源做了先删除后新建的操作。")]),a._v(" "),n("li",[a._v("命令的详细格式为： terraform taint <资源类型>.<资源名称>")])])]),a._v(" "),n("li",[a._v("terraform untaint：取消被污染标记")]),a._v(" "),n("li",[a._v("terraform output：打印出参及其值")]),a._v(" "),n("li",[a._v("terraform state list：列出当前state中的所有资源")]),a._v(" "),n("li",[a._v("terraform state show：展示某一个资源的属性")]),a._v(" "),n("li",[a._v("terraform state pull：获取当前state内容并展示")]),a._v(" "),n("li",[a._v("terraform state rm：移除特定的资源\n"),n("ul",[n("li",[a._v("state rm命令用于将state中的某个资源移除，但是实际上并不会真正删除这个资源，命令格式为：terraform state rm <资源类型>.<资源名称>")])])]),a._v(" "),n("li",[a._v("terraform state mv：变更特定资源的存放地址")]),a._v(" "),n("li",[a._v("terraform init：初始化加载模块")]),a._v(" "),n("li",[a._v("terraform graph：输出当前模板定义的资源关系图\n"),n("ul",[n("li",[a._v("terraform graph | dot -Tsvg > graph.svg\n"),n("ul",[n("li",[a._v("直接输出为一张图片，需要提前安装graphviz.")])])])])]),a._v(" "),n("li",[a._v("terraform validate：验证模板语法是否正确")])]),a._v(" "),n("h2",{attrs:{id:"模板"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#模板"}},[a._v("#")]),a._v(" 模板")]),a._v(" "),n("p",[a._v("阿里云ecs实例模板文件")]),a._v(" "),n("div",{staticClass:"language-tf line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[a._v('variable "name" {\n  default = "terraform-example"\n}\n\n# Create a new ECS instance for a VPC\nresource "alicloud_security_group" "group" {\n  name        = var.name\n  description = "foo"\n  vpc_id      = alicloud_vpc.vpc.id\n}\n\nresource "alicloud_kms_key" "key" {\n  description            = "Hello KMS"\n  pending_window_in_days = "7"\n  status                 = "Enabled"\n}\n\ndata "alicloud_zones" "default" {\n  available_disk_category     = "cloud_efficiency"\n  available_resource_creation = "VSwitch"\n}\n\n# Create a new ECS instance for VPC\nresource "alicloud_vpc" "vpc" {\n  vpc_name   = var.name\n  cidr_block = "172.16.0.0/16"\n}\n\nresource "alicloud_vswitch" "vswitch" {\n  vpc_id       = alicloud_vpc.vpc.id\n  cidr_block   = "172.16.0.0/24"\n  zone_id      = data.alicloud_zones.default.zones.0.id\n  vswitch_name = var.name\n}\n\nresource "alicloud_instance" "instance" {\n  # cn-beijing\n  availability_zone = data.alicloud_zones.default.zones.0.id\n  security_groups   = alicloud_security_group.group.*.id\n\n  # series III\n  instance_type              = "ecs.n4.large"\n  system_disk_category       = "cloud_efficiency"\n  system_disk_name           = var.name\n  system_disk_description    = "test_foo_system_disk_description"\n  image_id                   = "ubuntu_18_04_64_20G_alibase_20190624.vhd"\n  instance_name              = var.name\n  vswitch_id                 = alicloud_vswitch.vswitch.id\n  internet_max_bandwidth_out = 10\n  data_disks {\n    name        = "disk2"\n    size        = 20\n    category    = "cloud_efficiency"\n    description = "disk2"\n    encrypted   = true\n    kms_key_id  = alicloud_kms_key.key.id\n  }\n}\n')])]),a._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[a._v("1")]),n("br"),n("span",{staticClass:"line-number"},[a._v("2")]),n("br"),n("span",{staticClass:"line-number"},[a._v("3")]),n("br"),n("span",{staticClass:"line-number"},[a._v("4")]),n("br"),n("span",{staticClass:"line-number"},[a._v("5")]),n("br"),n("span",{staticClass:"line-number"},[a._v("6")]),n("br"),n("span",{staticClass:"line-number"},[a._v("7")]),n("br"),n("span",{staticClass:"line-number"},[a._v("8")]),n("br"),n("span",{staticClass:"line-number"},[a._v("9")]),n("br"),n("span",{staticClass:"line-number"},[a._v("10")]),n("br"),n("span",{staticClass:"line-number"},[a._v("11")]),n("br"),n("span",{staticClass:"line-number"},[a._v("12")]),n("br"),n("span",{staticClass:"line-number"},[a._v("13")]),n("br"),n("span",{staticClass:"line-number"},[a._v("14")]),n("br"),n("span",{staticClass:"line-number"},[a._v("15")]),n("br"),n("span",{staticClass:"line-number"},[a._v("16")]),n("br"),n("span",{staticClass:"line-number"},[a._v("17")]),n("br"),n("span",{staticClass:"line-number"},[a._v("18")]),n("br"),n("span",{staticClass:"line-number"},[a._v("19")]),n("br"),n("span",{staticClass:"line-number"},[a._v("20")]),n("br"),n("span",{staticClass:"line-number"},[a._v("21")]),n("br"),n("span",{staticClass:"line-number"},[a._v("22")]),n("br"),n("span",{staticClass:"line-number"},[a._v("23")]),n("br"),n("span",{staticClass:"line-number"},[a._v("24")]),n("br"),n("span",{staticClass:"line-number"},[a._v("25")]),n("br"),n("span",{staticClass:"line-number"},[a._v("26")]),n("br"),n("span",{staticClass:"line-number"},[a._v("27")]),n("br"),n("span",{staticClass:"line-number"},[a._v("28")]),n("br"),n("span",{staticClass:"line-number"},[a._v("29")]),n("br"),n("span",{staticClass:"line-number"},[a._v("30")]),n("br"),n("span",{staticClass:"line-number"},[a._v("31")]),n("br"),n("span",{staticClass:"line-number"},[a._v("32")]),n("br"),n("span",{staticClass:"line-number"},[a._v("33")]),n("br"),n("span",{staticClass:"line-number"},[a._v("34")]),n("br"),n("span",{staticClass:"line-number"},[a._v("35")]),n("br"),n("span",{staticClass:"line-number"},[a._v("36")]),n("br"),n("span",{staticClass:"line-number"},[a._v("37")]),n("br"),n("span",{staticClass:"line-number"},[a._v("38")]),n("br"),n("span",{staticClass:"line-number"},[a._v("39")]),n("br"),n("span",{staticClass:"line-number"},[a._v("40")]),n("br"),n("span",{staticClass:"line-number"},[a._v("41")]),n("br"),n("span",{staticClass:"line-number"},[a._v("42")]),n("br"),n("span",{staticClass:"line-number"},[a._v("43")]),n("br"),n("span",{staticClass:"line-number"},[a._v("44")]),n("br"),n("span",{staticClass:"line-number"},[a._v("45")]),n("br"),n("span",{staticClass:"line-number"},[a._v("46")]),n("br"),n("span",{staticClass:"line-number"},[a._v("47")]),n("br"),n("span",{staticClass:"line-number"},[a._v("48")]),n("br"),n("span",{staticClass:"line-number"},[a._v("49")]),n("br"),n("span",{staticClass:"line-number"},[a._v("50")]),n("br"),n("span",{staticClass:"line-number"},[a._v("51")]),n("br"),n("span",{staticClass:"line-number"},[a._v("52")]),n("br"),n("span",{staticClass:"line-number"},[a._v("53")]),n("br"),n("span",{staticClass:"line-number"},[a._v("54")]),n("br"),n("span",{staticClass:"line-number"},[a._v("55")]),n("br"),n("span",{staticClass:"line-number"},[a._v("56")]),n("br"),n("span",{staticClass:"line-number"},[a._v("57")]),n("br"),n("span",{staticClass:"line-number"},[a._v("58")]),n("br")])]),n("p",[a._v("轻量应用服务器示例")]),a._v(" "),n("div",{staticClass:"language-tf line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[a._v('variable "name" {\n  default = "tf_example"\n}\n\ndata "alicloud_simple_application_server_images" "default" {}\ndata "alicloud_simple_application_server_plans" "default" {}\n\nresource "alicloud_simple_application_server_instance" "default" {\n  payment_type   = "Subscription"\n  plan_id        = data.alicloud_simple_application_server_plans.default.plans.0.id\n  instance_name  = var.name\n  image_id       = data.alicloud_simple_application_server_images.default.images.0.id\n  period         = 1\n  data_disk_size = 100\n}\n')])]),a._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[a._v("1")]),n("br"),n("span",{staticClass:"line-number"},[a._v("2")]),n("br"),n("span",{staticClass:"line-number"},[a._v("3")]),n("br"),n("span",{staticClass:"line-number"},[a._v("4")]),n("br"),n("span",{staticClass:"line-number"},[a._v("5")]),n("br"),n("span",{staticClass:"line-number"},[a._v("6")]),n("br"),n("span",{staticClass:"line-number"},[a._v("7")]),n("br"),n("span",{staticClass:"line-number"},[a._v("8")]),n("br"),n("span",{staticClass:"line-number"},[a._v("9")]),n("br"),n("span",{staticClass:"line-number"},[a._v("10")]),n("br"),n("span",{staticClass:"line-number"},[a._v("11")]),n("br"),n("span",{staticClass:"line-number"},[a._v("12")]),n("br"),n("span",{staticClass:"line-number"},[a._v("13")]),n("br"),n("span",{staticClass:"line-number"},[a._v("14")]),n("br"),n("span",{staticClass:"line-number"},[a._v("15")]),n("br")])])])}),[],!1,null,null,null);s.default=t.exports}}]);