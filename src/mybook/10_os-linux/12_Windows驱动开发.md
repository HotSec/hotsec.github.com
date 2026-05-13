# Windows 驱动开发

## 1. 驱动概述

### 1.1 什么是 Windows 驱动

驱动程序是操作系统内核的一部分，负责：
- 与硬件设备通信
- 提供系统服务
- 管理资源

### 1.2 驱动类型

| 类型 | 说明 | 示例 |
|------|------|------|
| WDM | Windows Driver Model | USB设备 |
| UMDF | User-Mode Driver Framework | 打印机 |
| KMDF | Kernel-Mode Driver Framework | 磁盘控制器 |
| WDF | Windows Driver Framework | 通用驱动 |
| Minifilter | 文件系统过滤 | 杀毒软件 |

## 2. 开发环境配置

### 2.1 必备工具

- Windows SDK
- Windows Driver Kit (WDK)
- Visual Studio
- Debugging Tools for Windows (WinDbg)

### 2.2 环境变量

```bat
set WDK_ROOT=C:\Program Files (x86)\Windows Kits\10
set SDK_ROOT=C:\Program Files (x86)\Windows Kits\10
```

## 3. KMDF 内核驱动

### 3.1 简单驱动示例

```c
#include <ntddk.h>
#include <wdf.h>

DRIVER_INITIALIZE DriverEntry;
EVT_WDF_DRIVER_DEVICE_ADD EvtDeviceAdd;

NTSTATUS DriverEntry(
    _In_ PDRIVER_OBJECT DriverObject,
    _In_ PUNICODE_STRING RegistryPath
)
{
    WDF_DRIVER_CONFIG config;
    NTSTATUS status;

    WDF_DRIVER_CONFIG_INIT(&config, EvtDeviceAdd);
    status = WdfDriverCreate(DriverObject, RegistryPath,
        WDF_NO_OBJECT_ATTRIBUTES, &config, WDF_NO_HANDLE);

    return status;
}

NTSTATUS EvtDeviceAdd(
    _In_ WDFDRIVER Driver,
    _Inout_ PWDFDEVICE_INIT DeviceInit
)
{
    WDF_OBJECT_ATTRIBUTES attributes;
    WDFDEVICE device;
    NTSTATUS status;

    WDF_OBJECT_ATTRIBUTES_INIT(&attributes);
    status = WdfDeviceCreate(&DeviceInit, &attributes, &device);
    return status;
}
```

### 3.2 设备对象创建

```c
WDF_IO_QUEUE_CONFIG ioConfig;
WDF_IO_QUEUE_CONFIG_INIT_DEFAULT_QUEUE(&ioConfig, 
    WdfIoQueueDispatchSequential);

ioConfig.EvtIoRead = EvtIoRead;
ioConfig.EvtIoWrite = EvtIoWrite;

status = WdfIoQueueCreate(device, &ioConfig,
    WDF_NO_OBJECT_ATTRIBUTES, WDF_NO_HANDLE);
```

## 4. 设备 IO 请求

### 4.1 读取请求处理

```c
VOID EvtIoRead(
    _In_ WDFQUEUE Queue,
    _In_ WDFREQUEST Request,
    _In_ size_t Length
)
{
    PVOID buffer;
    size_t bytesRead;
    NTSTATUS status;

    status = WdfRequestRetrieveOutputBuffer(
        Request, Length, &buffer, NULL);

    if (NT_SUCCESS(status)) {
        // 填充数据到 buffer
        WdfRequestCompleteWithInformation(
            Request, STATUS_SUCCESS, bytesRead);
    } else {
        WdfRequestComplete(Request, status);
    }
}
```

### 4.2 写入请求处理

```c
VOID EvtIoWrite(
    _In_ WDFQUEUE Queue,
    _In_ WDFREQUEST Request,
    _In_ size_t Length
)
{
    PVOID buffer;
    size_t bytesWritten;
    NTSTATUS status;

    status = WdfRequestRetrieveInputBuffer(
        Request, Length, &buffer, NULL);

    if (NT_SUCCESS(status)) {
        // 处理写入数据
        WdfRequestCompleteWithInformation(
            Request, STATUS_SUCCESS, bytesWritten);
    } else {
        WdfRequestComplete(Request, status);
    }
}
```

## 5. 注册表与设备元数据

### 5.1 INF 文件示例

```inf
[Version]
Signature="$CHICAGO$"
Class=System
ClassGuid={4d36e97d-e325-11ce-bfc1-08002be10318}
Provider=%Manufacturer%
CatalogFile=MyDriver.cat
DriverVer=1.0.0.0

[DestinationDirs]
DefaultDestDir=12
MyDriver_Device_CoInstaller_CopyFiles=11

[SourceDisksNames]
1=MyDriver Disk,,,""

[SourceDisksFiles]
MyDriver.sys=1,,

[Manufacturer]
%Manufacturer%=MyDriver,NTamd64.10.0

[MyDriver.NTamd64.10.0]
%DeviceDescription%=MyDriver_Device, Root\MyDriver

[MyDriver_Device.NT]
CopyFiles=MyDriver_Device_CopyFiles

[MyDriver_Device_CopyFiles]
MyDriver.sys

[MyDriver_Device.NT.Services]
AddService=MyDriver,MyDriver_Service_Inst

[MyDriver_Service_Inst]
DisplayName=%ServiceName%
ServiceType=1
StartType=3
ErrorControl=1
ServiceBinary=%12%\MyDriver.sys

[Strings]
Manufacturer="My Company"
DeviceDescription="My Driver"
ServiceName="MyDriver"
```

## 6. 调试技巧

### 6.1 WinDbg 连接

```bat
bcdedit /debug on
bcdedit /dbgsettings serial debugport:1 baudrate:115200
```

### 6.2 常用调试命令

```
!drvobj MyDriver 2    // 列出设备对象
!devstack 0xffff...  // 查看设备堆栈
!thread              // 当前线程信息
!process 0 0         // 列出所有进程
```

## 7. 安全最佳实践

- 严格验证用户输入
- 使用池标签识别内存分配
- 避免在中断级执行敏感操作
- 启用驱动程序验证程序

## 8. 常见陷阱

- 错误使用 `MmProbeAndLockPages`
- 忘记保护共享资源
- 中断级操作不当
