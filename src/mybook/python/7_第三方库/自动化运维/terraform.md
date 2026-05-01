# terraform

## 安装

```bash
git clone https://github.com/hashicorp/terraform.git
cd terraform
make
```

## 常用命令

- terraform plan：资源的预览
- terraform apply：资源的新建和变更
  - --auto-approve 跳过人工确认
- terraform show：资源的展示
- terraform destroy：资源的释放
  - --force 跳过二次确认
- terraform import：资源的导入
- terraform taint：标记资源为被污染
  - taint命令用于把某个资源标记为被污染状态，当再次执行apply命令时，这个被污染的资源将会被先释放，然后再创建一个新的，相当于对这个特定资源做了先删除后新建的操作。
  - 命令的详细格式为： terraform taint <资源类型>.<资源名称>
- terraform untaint：取消被污染标记
- terraform output：打印出参及其值
- terraform state list：列出当前state中的所有资源
- terraform state show：展示某一个资源的属性
- terraform state pull：获取当前state内容并展示
- terraform state rm：移除特定的资源
  - state rm命令用于将state中的某个资源移除，但是实际上并不会真正删除这个资源，命令格式为：terraform state rm <资源类型>.<资源名称> 
- terraform state mv：变更特定资源的存放地址
- terraform init：初始化加载模块
- terraform graph：输出当前模板定义的资源关系图
  - terraform graph | dot -Tsvg > graph.svg
    - 直接输出为一张图片，需要提前安装graphviz.
- terraform validate：验证模板语法是否正确

## 模板

阿里云ecs实例模板文件

```tf
variable "name" {
  default = "terraform-example"
}

# Create a new ECS instance for a VPC
resource "alicloud_security_group" "group" {
  name        = var.name
  description = "foo"
  vpc_id      = alicloud_vpc.vpc.id
}

resource "alicloud_kms_key" "key" {
  description            = "Hello KMS"
  pending_window_in_days = "7"
  status                 = "Enabled"
}

data "alicloud_zones" "default" {
  available_disk_category     = "cloud_efficiency"
  available_resource_creation = "VSwitch"
}

# Create a new ECS instance for VPC
resource "alicloud_vpc" "vpc" {
  vpc_name   = var.name
  cidr_block = "172.16.0.0/16"
}

resource "alicloud_vswitch" "vswitch" {
  vpc_id       = alicloud_vpc.vpc.id
  cidr_block   = "172.16.0.0/24"
  zone_id      = data.alicloud_zones.default.zones.0.id
  vswitch_name = var.name
}

resource "alicloud_instance" "instance" {
  # cn-beijing
  availability_zone = data.alicloud_zones.default.zones.0.id
  security_groups   = alicloud_security_group.group.*.id

  # series III
  instance_type              = "ecs.n4.large"
  system_disk_category       = "cloud_efficiency"
  system_disk_name           = var.name
  system_disk_description    = "test_foo_system_disk_description"
  image_id                   = "ubuntu_18_04_64_20G_alibase_20190624.vhd"
  instance_name              = var.name
  vswitch_id                 = alicloud_vswitch.vswitch.id
  internet_max_bandwidth_out = 10
  data_disks {
    name        = "disk2"
    size        = 20
    category    = "cloud_efficiency"
    description = "disk2"
    encrypted   = true
    kms_key_id  = alicloud_kms_key.key.id
  }
}
```

轻量应用服务器示例

```tf
variable "name" {
  default = "tf_example"
}

data "alicloud_simple_application_server_images" "default" {}
data "alicloud_simple_application_server_plans" "default" {}

resource "alicloud_simple_application_server_instance" "default" {
  payment_type   = "Subscription"
  plan_id        = data.alicloud_simple_application_server_plans.default.plans.0.id
  instance_name  = var.name
  image_id       = data.alicloud_simple_application_server_images.default.images.0.id
  period         = 1
  data_disk_size = 100
}
```
