# C笔记 

[TOC]
<!-- TOC -->
- [0. 预处理](#0-%E9%A2%84%E5%A4%84%E7%90%86)
- [1. 数据](#1-%E6%95%B0%E6%8D%AE)
- [2. 输入和输出](#2-%E8%BE%93%E5%85%A5%E5%92%8C%E8%BE%93%E5%87%BA)
- [3. 运算符和表达式](#3-%E8%BF%90%E7%AE%97%E7%AC%A6%E5%92%8C%E8%A1%A8%E8%BE%BE%E5%BC%8F)
- [4. 一维数组](#4-%E4%B8%80%E7%BB%B4%E6%95%B0%E7%BB%84)
- [5. 程序三大结构](#5-%E7%A8%8B%E5%BA%8F%E4%B8%89%E5%A4%A7%E7%BB%93%E6%9E%84)
- [6. 二维数组](#6-%E4%BA%8C%E7%BB%B4%E6%95%B0%E7%BB%84)
- [7. 函数](#7-%E5%87%BD%E6%95%B0)
- [8. 作用域](#8-%E4%BD%9C%E7%94%A8%E5%9F%9F)
- [9. 生存周期](#9-%E7%94%9F%E5%AD%98%E5%91%A8%E6%9C%9F)
- [10. 预处理](#10-%E9%A2%84%E5%A4%84%E7%90%86)
- [11. 一级指针](#11-%E4%B8%80%E7%BA%A7%E6%8C%87%E9%92%88)
- [12. 结构体struct](#12-%E7%BB%93%E6%9E%84%E4%BD%93struct)
- [13. 联合体union](#13-%E8%81%94%E5%90%88%E4%BD%93union)
- [14. 枚举enum](#14-%E6%9E%9A%E4%B8%BEenum)
- [15. 堆空间](#15-%E5%A0%86%E7%A9%BA%E9%97%B4)
- [16. 程序的内存空间布局](#16-%E7%A8%8B%E5%BA%8F%E7%9A%84%E5%86%85%E5%AD%98%E7%A9%BA%E9%97%B4%E5%B8%83%E5%B1%80)
- [17. 高级指针](#17-%E9%AB%98%E7%BA%A7%E6%8C%87%E9%92%88)
- [18. 文件操作](#18-%E6%96%87%E4%BB%B6%E6%93%8D%E4%BD%9C)
- [19. 杂项](#19-%E6%9D%82%E9%A1%B9)
- [20. 控制台编程](#20-%E6%8E%A7%E5%88%B6%E5%8F%B0%E7%BC%96%E7%A8%8B)

<!-- /TOC -->

## 0. 预处理
- 1.预处理指令
    - 1.'#'开头的指令都被称为预处理指令
    - 2.预处理的作用
    - 3.查看预处理后的结果
    - 4.#include <>  #include ""
 
## 1. 数据
- 1.常量
    - 1.字面量
        - 1.字面量的类型
- 2.宏
   - 1.宏的定义
   - 2.宏的使用
   - 3.宏的缺陷
- 2.变量
   - 1.变量类型
       - 1.基本数据类型
       - 2.修饰类型 static
            - 寄存器变量
        - register int nNum;  //正确
        - register char szStr[5]; //错误;超出寄存器的大小
   - 2.变量的定义
        - 1.没有定义变量就使用时,将产生无法识别的标识符的错误.
   - 3.变量的初始化
   - 4.变量的赋值
       - 1.赋值时'='两边的变量类型不匹配时将会产生错误.
   - 5.类型转换
        - 1.隐式转换
        ``` c
        char -> short -> int -> long -> float -> double
        进行赋运算的时候，会将右值类型自动转换为左值，有可能会丢失数据。
        例：
        int i = 10 ;
        float c = 2.5 ;
        i = i/c;
        注： i/c = 4.000 i 先自动转成float进行计算，结果再转换成=左侧的类型。最终i= 4 ;
        ```
        - 2.显示转换(强制转换)
        ``` c
        强制类型转换
        通过使用转换可以将一个 表达式强制转换成某一种类型，是一元运算符。
            例：
            float  b = 13.44;
            int  a = (int)b;        //将float类型强制转换成int型
        ```
## 2. 输入和输出
- 2.1 printf格式化输出函数
   - 2.1.1 printf的格式化输出控制符
    ```
    %d    按十进制整型数据的实际长度输出
    %md   m指定的输出字段的宽度，如果数据的位数小于m，则左端补空格，大于m，则按照实际位数输出（右对齐）
    %-md 如果数据的位数小于m位，右端补空格，若大于m，则按实际位数输出（左对齐）
    %ld：输出长整型数据
    %o：以八进制的形式输出整数
    %x：以十六进制数形式输出整数
    %u：用来输出无符号型数据
    %c：输出char类型 ascii
    %s：字符串
    %ms：输出的字符串占m列，如果字符串本身长度大于m，则全部输出，若小则左补空格
    %-ms：若串长小于m，则在m列范围内，字符串向左靠，右补空格
    %f：不指定字段宽度，由系统自动指定，使整数部分全部输出，并输出六位小数。在输出的数字中并非全部数据都是有效数字。单精度实数的有效位数一般为七位。
    %m.nf：指定输出的数据共占列，其中有n位小数。如果数值长度小于m，则左端补空格。
    %-m.nf：右端补空格
    %p：打印输出一个地址
 
    printf("%*.*l", m, n, l);
 
    ```
 
 
    - 2.1.2 printf的参数列表
- 2.2 scanf格式化输入函数
    ``` c
        scanf、scanf_s
        char szCh[] = "hello";
        scanf_s("%s", szCh, 6);
        scanf_s("%d",&a)
        scanf_S("%c",&c, 1);
        char str[] ={"hello"}; 
        scanf_s("%s",&str, 8);
    ```
   - 2.2.1 scanf的格式化输入控制符
   - 2.2.2 scanf的参数列表
 
        备注：scanf_s函数在接收字符或字符串时需要加入长度，字符为１，字符串自定义长度。
   - 2.2.3 清空输入缓冲区
        - 2.2.3.1 scanf("%*[^\n]");scanf("%*c");
## 3. 运算符和表达式
- 3.1 运算符种类
    运算符：http://tool.oschina.net/commons?type=6#cpp_
   - 3.1.1 算数运算符
   - 3.1.2 赋值运算符
   - 3.1.3 位运算符
        - ＆ 按位与 都是1为1，否则为0
        - ｜ 按位或 有1为1，都是0为0
        - ＾ 按位异或  a^b 如果a、b两个操作数的相应位同号，则结果为0，异号为1
 
        - x>>2　x右移2位，右部移出部分舍弃，左端高位根据符号位补0或者1，无符号或正数补0，负数补1。
 
        - x<<2  　x左移2位，左端高位移出部分舍弃，右端低位补０
   - 3.1.4 条件运算符
   - 3.1.5 逗号运算符
   - 3.1.6 sizeof运算符
- 3.2 运算符优先级和结合性
    括号优先级最高，逗号优先级最低
 
     *** 注意："&&"与"||"为短路运算符，&&当左值为假时，不在管右边;||当左值为真时，不在计算右边的值 ***
 
    c语言运算符优先级
    - 后缀运算符：
      - () 函数调用
      - [] 数组下标
      - . 成员访问
      - -> 通过指针访问成员
      - ++ 后缀增量
      - -- 后缀减量
    - 一元运算符：
      - ++ 前缀增量
      - -- 前缀减量
      - + 一元加
      - - 一元减
      - ! 逻辑非
      - ~ 按位非
      - * 解引用
      - & 取地址
      - sizeof sizeof运算符
      - _Alignof 对齐要求（C11标准新增）
    - 乘除运算符：
      - * 乘法
      - / 除法
      - % 取模
    - 加减运算符：
      - + 加法
      - - 减法
      - 位移运算符：
      - << 左移
      - >> 右移
    - 关系运算符：
      - < 小于
      - <= 小于或等于
      - > 大于
      - >= 大于或等于
    - 相等运算符：
      - == 等于
      - != 不等于
    - 按位与运算符：
      - & 按位与
    - 按位异或运算符：
      - ^ 按位异或
    - 按位或运算符：
      - | 按位或
    - 逻辑与运算符：
      - && 逻辑与
    - 逻辑或运算符：
      - || 逻辑或
    - 条件运算符：
      - ?: 条件
    - 赋值运算符：
      - = 赋值
      - += 加后赋值
      - -= 减后赋值
      - *= 乘后赋值
      - /= 除后赋值
      - %= 取模后赋值
      - <<= 左移后赋值
      - >>= 右移后赋值
      - &= 按位与后赋值
      - ^= 按位异或后赋值
      - |= 按位或后赋值
    - 逗号运算符：
      - , 逗号
 
- 3.3 表达式的种类
   - 3.3.1 赋值表达式
   - 3.3.2 算术表达式
   - 3.3.3 关系表达式
   - 3.3.4 逻辑表达式
   - 3.3.5 函数表达式
- 3.4 表达式的值
   - 3.4.1 表达式的求值过程.
- 3.5 复合表达式
   - 3.5.1 复合表达式的识别
   - 3.5.1 复合表达式中的子表达式求值顺序
## 4. 一维数组
- 4.1 一维数组的定义
    - 数据类型 数组名[数组长度]; 
    - 数组是有序数列的集合
    - 例： ``` int arrTem[11] ```
    - 不能用变量作为数组的长度(c++11中数组长度可以是变量)
 
 
 
    - 数组的初始化
        - 当右边集合里的元素已经被使用完了的时候，数组中剩余的元素被默认赋值为0
        - 不给定数组长度，根据实际数组元素个数分配
        - ``` int arrl[] = {1, 1, 3, 5, 8, 8}```
        - 共有6个元数，所以实际分配24个字节空间
        - 右边大括号里不能为空，为空数组长度就为0了，c语言中不允许数组长度为0。
        - int nArrray[] = {}; //报错
        - 要想给数组一次赋多个值，只能在数组定义的时候。之后只能一个一个元素的赋值。不能直接将一个数组赋给另一个数组。
    - 4.1.1 最大下标的作用
- 4.2 - 一维数据的初始化
   - 4.2.1 完全初始化
     - 整体赋值 ``` int ary1[5] = {1, 2, 3, 4, 5} ```
   - 4.2.2 部分初始化
     - 部分赋值 ``` int arr1[5] = {1, 2, 3} ```
- 4.3 一维数组的使用
 
- 4.4 一维数组的遍历
- 4.5 一维数组的内存
- 4.5 一维数据下标越界
- 4.6 字符数组
   - 4.6.1 字符数组的赋值
        - printf("%c","asdfghijk"[1]);  //打印'a'
        - 字符数组的输入输出
        - 逐个字符输入和输出。用格式符 ==%c== 输入或输出一个字符。
        - 将整个字符串一次输入或输出。用 ==%s== 格式符，意思是对字符串的输入输出。
        - ==注意：==
            - 输出字符不包括结束符 \0
   - 4.6.2 字符串数组的长度
        - 注意：
        - 对于没有给定数组长度的情况，此时字符串数组长度为字符串字符个数加1，因为要预留一个字符串结尾。 ('\0')
        - 如果一个字符串数组包含一个以上'\0'时，则遇到第一个'\0'结束。
 
        - wchar_t与char类型的数组的区别
        - wchar_t的每一个元素占两个字节，字符或字符串前加上==L==  wchar_t中文字符串用%S
        ``` c
        //对于wchar_t类型的常量，需要在字符前加上==L==。 L 'A'
        //在实际使用中，wchar_t类型的字符前面可以不用加"L";
        //对于wchar_t类型的字符串常量，需要在字符串前加上L。
            L"heello world"   //一个字符占两个字节
        //对于wchar_t类型的字符串，处理这类字符串的函数一般都是w版的
            wchar_t szString[] = L"helloworld";
            wprintf(L"%s", szString); //中文的话用大写的S
        char string[100];
        scanf_s("%s", string, 100);
        ```
   - 4.6.3 字符串相关函数
        - 4.6.3.1 字符串拷贝函数
            - 字符串拷贝strcpy strcpy_s wcscpy_s
            ``` c
            char *strcpy(char *strDestination, char *strSource);
            errno_t strcpy_s(char *strDestination, size_t, char *strSource);
            char *strcpy(wchar_t *strDestination, wchar_t *strSource);
            errno_t wcscpy_s(wchar_t *strDestination, size_t, wchar_t *strSource);
            ```
        - 4.6.3.2 字符串连接函数
            - 字符串连接strcat strcat_s srncat
            ``` c
            char *strcat(char *strDestination, char *strSource);
            errno_t strcat_s(char *strDestination, size_t, charSource);
            wchar_t *wcscat(wchar_t *strDestination, char *strSource);
            errno_t wcscat_s(wchar_t, size_t, wchar_t);
 
            char * strncat(char*dest,char*src,int n);
            //把src所指向字符串的那前n个字符添加到dest结尾处（覆盖dest结尾处的“\0")并添加”\0".
            ```
        - 4.6.3.3 字符串比较函数
            - 字符串比较strcmp wcscmp strcasecmp stricmp strncmpi memcmp memicmp
            - 对两个字符串 从左向右逐个字符比较（ASCII），直到遇到不同字符或 \0 为止
            - 若参数1中字符串和参数2中字符串相同则返回0;
            - 若参数1中字符串长度大于参数2中字符串长度则返回大于0的值;
            - 若参数1中字符串长度小于参数2中字符串长度则返回小于0的值。
            ``` c
            int strcmp(char *string1, char *string2);
            int wcscmp(wchar_t *string1, wchar_t *string2);
            int strcasecmp(cons char *str1, const char *strl2); // 比较时会自动忽略大小写的差异
            int stricmp(char *str1, char *str2); //以大小写不敏感方式比较两个串
            int strncmpi(char *str1, char *str2, unsigned maxlen); //比较字符串str1和str2的前maxlen个字符
            int memcmp(void *buf1, void *buf2, unsigned int count);//比较内存区域buf和buf2的前count个字节。void*是指任何类型的指针。
            int memicmp(void *buf1, void *buf2, unsigned int count); //比较内存区域buf1和buf2的前count个字节，但不区分大小写。
            ```
        - 4.6.3.4 求字符串长度函数
            - 获取字符串长度strlen wcsnlen wcsnlen_s
            - 获取char型字符串长度
            ``` c
            #include <string.h>
            size_t strlen(char *str);
            size_t strlen_s(char *str, size_t number0fElements); //size_t           number0fElements字符串的最大长度
            size_t wcsnlen(wchar_t *str, size_t number0fElements);
            size_t wcsnlen_s(wchar_t *str, size_t numbr0fElements);
            ```
            ``` c
            // 例：
            #include <string.h>
            int _tamin(int argc, _TCHAR *argv[])
            {
            char strChA [100] = "abcdef";
            strlen(strChA);
            strnlen_s(strChA, 100);  //100为数组的大小
            wchar_t strChAB[100] = L"abcdef"; //wchar_t类型
            wcslen(strChAB);
            wcsnlen_s(strChAB, 100);
            return 0;
            }
            ```
        - 4.6.3.5 字符串查找函数
            - strstr strtok
            ``` c
            char* strstr(char* src, char* find);
            //从字符串src中寻找find第一次出现的位置(不比较结束符NULL)
            //返回指向第一次出现find位置的指针，如果没有找到则返回NULL
            char *strtok(char *src, char *delim);
            //分解字符串？一组标记串，src为要分解的字符串，delim为分隔字符串。
            //首次调用时，src必须指向要分解的字符串，随后调用要把s设成NULL;
            //strtok中查找包含在delim中的字符，并用NULL('\n'）来替换直到找遍整个字符串
            //从s开头开始一个个被分隔的串。当没有被分隔的串时返回NULL，所有delim中包含的字符串都会被滤掉，并将被滤调的地方设为一处分隔节点。
            ```
        - 4.6.3.6 字符串转换函数
           - 4.6.3.6.1 小写字母转大写字母
 
            ``` c
            char ch = toupper('a');
            //转换单个字符
            char *strlwr(char*src)
            //函数说明：将字符串src转换成大写形式，只转换src中出现的小写字母，不改变其他字符
            //返回值：返回指向src的指针
 
            char* strlwr(char*src)
            //函数说明：将字符串src转换成小写形式，只转换src中出现的大写字母，不改变其他字符
            //返回值：返回指向src的指针
            ```
 
           - 4.6.3.6.2 大写字母转小写字母
 
                ``` char chA = tolower('A'); ```
        - 4.6.3.7 字符串、整形、浮点型相互转换
            - 一、整型转字符串型
 
                1. int转为字符串
 
                    itoa(int _Value, char *_Buffer, int _Radix);　　
 
                    需改为_itos_s(int _Value, char *_Buffer, size_t _BufferCount, int _Radix);
 
                    _Radix：表示进制，若十进制则Radix为10
 
                    _BufferCount：存储的大小，不可以比Buffer的长度大
 
                ``` c
 
                #include <iostream>
 
                using namespace std;
 
                void main()
                {
                    int num = 10;
                    char str[3];                        // str的长度最少为3，因为10虽然两位，但还有一个结束符
                    _itoa_s(num, str, sizeof(str), 10);    // int转为字符串
                    cout << str << endl;                // 输出结果为10
                }
                ```
                2. long int转为字符串
 
                    ltoa(long _Value, char *_Buffer, int _Radix);　　
 
                    改为_ltoa_s(long _Value, char *_Buffer, size_t _BufferCount, int _Radix);
 
                3. 无符号长整型转为字符串
 
                    ultoa(unsigned long _Value, char *_Buffer, int _Radix);　　
 
                    改为_ultoa_s(unsigned long _Value, char *_Buffer, size_t _BufferCount, int _Radix);
 
                4. int型转为宽字符串型
 
                    _itow(int _Value, wchar_t *_Buffer, int _Radix);　
 
                    改为_itow_s(int _Value, wchar_t *_Buffer, size_t _BufferCount, int _Radix);
 
            - 二、浮点型转字符串型
 
                1. double型转为字符串
 
                    gcvt(double _Value, int _DigitCount, char* _DstBuf);　　
 
                    改为_gcvt_s(char* _Buffer, size_t _BufferCount, double _Value, int _DigitCount);
 
                    说明：显示正负号、小数点
 
                    _Digitcount：显示的位数，如1.25，显示两位是1.3（四舍五入），显示三位是1.25
 
                ``` c
                #include <iostream>
 
                using namespace std;
 
                 void main ()
                {
                    double num = -1.235;
                    char str[7];                        // 在字符串中，正负号、小数点、结束符各占一位
                    _gcvt_s(str, sizeof(str), num, 3);    // double转为字符串，显示三位，1.235四舍五入为1.24
                    cout << str << endl;                // 输出结果为-1.24
                }
                ```
                2. double转换为字符串
 
                    ecvt(double _Value, int _DigitCount, int *_PtDec, int *_PtSign);　　
 
                    改为_ecvt_s(char *_Buffer, size_t _BufferCount, double _Value, int _DigitCount, int *_PtDec, int *_PtSign);
 
                    说明：不显示小数点和正负号
 
                    _PtDec：表示小数点位置，若_PtDec为1，说明小数点左边有一个数
 
                    _PtSign：表示正负号，0为正数，1为负数
 
                ``` c
                 #include <iostream>
 
                using namespace std;
 
                 void main ()
                {
                    double num = -1.235;
                    int Dec, Sign;                                    // Dec:小数点位置，Sign:正负号
                    char str[5];                                    // ？至少5位
                    _ecvt_s(str, sizeof(str), num, 3, &Dec, &Sign);    // double转str，剔除正负号和小数点，显示三位，1235四舍五入为124
                    cout << str << endl;                            // 输出结果为124
                    cout << Dec << endl;                            // 输出结果为1，小数点左面有一个数
                    cout << Sign << endl;                            // 输出结果为1，是负数
                }
                ```
                3. double转换为字符串
 
                    fcvt(double _Value, int _FractionalDigitCount, int *_PtDec, int *_PtSign);
 
                    改为_fcvt(char *_Buffer, size_t _BufferCount, double _Value, int _FractionalDigitCount, int *_PtDec, int *_PtSign);
 
                    说明：转换结果中不包含小数点和正负号
 
                    _FractionalDigitCount：取小数位数，若_FractionalDigitCount为1，则取一位小数，要四舍五入
 
                ``` c
                #include <iostream>
 
                using namespace std;
 
                void main ()
                {
                    double num = -1.235;
                    int Dec, Sign;                                    // Dec:小数点位置，Sign:正负号
                    char str[5];                                    // ？至少5位
                    _fcvt_s(str, sizeof(str), num, 2, &Dec, &Sign); // double转str，剔除正负号和小数点，取两位小数，1235四舍五入为124
                    cout << str << endl;                            // 输出结果为124
                    cout << Dec << endl;                            // 输出结果为1，小数点左面有一个数
                    cout << Sign << endl;                            // 输出结果为1，是负数
                }
                ```
            - 三、字符串型转整型
 
                1. 将字符串转为int型
                    int atoi(const char *_String);
 
                2. 将字符串转为long型
 
                    long atol(const char *_String);
 
                3. 将字符串转为long型，并报告不能被转换的所有剩余部分
 
                    long strtol(const char *_String, char **_EndPtr, int _Radix);
 
                    _Radix：表示进制，范围为2~36和0
 
                    _EndPtr：指向字符串中不合法的部分
 
                    说明：若_Radix为2，则‘0’、‘1’合法，若_Radix为10，则‘0’、‘1’……‘9’合法，若_Radix为16，则‘0’，‘1’……‘f’合法
 
                ``` c
                #include <iostream>
 
                using namespace std;
 
                void main ()
                {
                    long num_2, num_8, num_10, num_16;
                    char str[20] = "1079aeg";
                    char *str1;
                    num_2 = strtol(str, &str1, 2);        // 二进制，10合法
                    cout << num_2 << endl;                // 输出2，二进制10在十进制中为2
                    cout << str1 << endl;                // 输出不合法的79aeg
                    num_8 = strtol(str, &str1, 8);        // 8进制，107合法
                    cout << num_8 << endl;                // 输出71,八进制107在十进制中为71
                    cout << str1 << endl;                // 输出不合法的9aeg
                    num_10 = strtol(str, &str1, 10);    // 10进制，1079合法
                    cout << num_10 << endl;                // 输出1079
                    cout << str1 << endl;                // 输出不合法的aef
                    num_16 = strtol(str, &str1, 16);    // 十六进制，1079ae合法
                    cout << num_16 << endl;                // 输出1079726，十六进制1079ae在十进制中为1079726
                    cout << str1 << endl;                // 输出不合法的g
                }
                ```
 
                4. 将字符串转为无符号长整型值，并报告不能被转换的所有剩余部分
 
                    unsigned long strtoul(const char *_String, char **_EndPtr, int _Radix);
 
            - 四、字符串型转浮点型
 
                1. 将字符串转换为双精度浮点型值
 
                    double atof(const char *_String);
 
                2. 将字符串转换为双精度浮点型值，并报告不能被转换的所有剩余数字
 
                    double strtod(const char *_String, char **_EndPtr);
        - 4.6.3.7 字符串逆向
            - strrev
 
            ``` c
             char * strrev ( char *src)
             //函数说明：把字符串str的所有字符的顺序颠倒过来（不包括NULL）
             //返回值：返回指向颠倒顺序后的字符串指针
            ```
 
 
 
## 5. 程序三大结构
- 5.1 顺序结构
   - 5.1.1 顺序结构的识别
   - 5.1.2 顺序结构的语句的执行流程
- 5.2 选择结构
   - 5.2.1 构成选择结构的语句:
       - 5.2.1.1 if语句的形式
           - 5.2.1.1.1 单if语句形式
 
                    if (表达式) {      ;}
           - 5.2.1.1.2 if和else形式
 
                     if (表达式)
                     {
                         ;
                     }
                     else{
                         ;
                     }
           - 5.2.1.1.3 if和else if形式
 
                     if (表达式)
                     {
                         ;
                     }else if(表达式)
                     {
                         ;
                     }
           - 5.2.1.1.4 if , else if和else形式
 
                    if (表达式)
                    {
                        ;
                    }
                    else if(表达式)
                    {
                        ;
                    }
                    else
                    {
                        ;
                    }
 
   - 5.2.2 构成选择结构体的语句:switch-case
       - 5.2.2.1 switch-case的形式
 
    
                 switch (表达式)
                 {
                    case 常量1:
                        ;
                    break;
                    default:
                        ;
                }
 
       - 5.2.2.2 break语句的作用
       - 5.2.2.3 default语句的作用
       - 5.2.2.4 case 标签的作用.
       - 5.2.2.5 switch-case语句的匹配过程
    - 5.2.3 if和switch语句的选择
 
        ```   
        if语句的优缺点：
 
        使用if结构能够实现较为复杂的逻辑判断
 
        用switch结构能够实现的结构，使用if结构都能实现
 
        分支较少的情况使用if结构更简单
 
        分支较多的情况下使用if结构会使程序结构变的复杂
 
        如果使用 if嵌套层次过深，也容易使程序变得复杂
 
        与switch结构相比if结构执行效率较低
 
        switch语句的优缺点：
 
        没有复杂的逻辑判断，程序结构简单
 
        对于分支很多的情况，特别适合用switch结构
 
        执行效率比if结构高
 
        switch结构只能基于一个整数值进行分支选择
 
        switch只能判断是否相等，不能判断在某一区间的值
        ```
- 5.3 循环结构
   - 5.3.1 while循环
       - 5.3.1.1 while循环的形式
 
                 while (表达式)
                 {
                     ;
                 }
   - 5.3.2 do-while循环
       - 5.3.2.1 do-while循环的形式
 
                 do
                 {
                     ;
                 }while(表达式);
   - 5.3.3 for循环
       - 5.3.3.1 for循环的形式
 
                 for( ; ; )
                 {
 
                     ;
                 }
       - 5.3.3.2 for循环的执行顺序和过程
   - 5.3.4 循环中break语句的作用
 
             退出循环体
   - 5.3.5 循环中continue语句
 
             中止本次循环，进行下一次循环
   - 5.3.6 嵌套循环
       - 5.3.6.1 嵌套循环的形式
       - 5.3.6.2 嵌套循环的总执行次数的计算
       - 5.3.6.3 嵌套循环的执行顺序
   - 5.3.7 死循环
       - 5.3.7.1 死循环的形成条件
## 6. 二维数组
- 6.1 二维数组的定义
     - 数据类型 数组名[][];
- 6.2 二维数组的初始化
   - 6.2.1 部分初始化
   - 6.2.2 完全初始化
- 6.3 二维数组的使用
- 6.4 二维数组的遍历
- 6.5 二维数组的内存
- 6.6 二维数据下标越界
- 6.7 二维字符数组
## 7. 函数
- 7.1 函数的组成
   - 7.1.1 函数头(就是函数的声明)
       - 7.1.1.1 返回值类型
            - 返回值作为函数表达式的结果
- 返回值的类型必须何定义的时候一致
       - 7.1.1.2 函数名
       - 7.1.1.2 参数列表
           - 7.1.1.2.1 各个参数的类型(形式参数)
   - 7.1.2 函数体
- 7.2 函数的声明
- 7.3 函数的定义
     - 函数的格式
```
返回值类型 函数名 (参数类型 形式参数1, 参数类型 形式参数2, ... )
{
语句序列;
return 返回值;
}
//例：
int max(int x, int y)
{
int z;
z = x > y ? x : y;
return z;
}
```
- 7.4 函数的调用
   - 7.4.1 调用位置
        -  ```函数名(实参)```
   - 7.4.2 返回位置
- 7.5 函数的形参
     - 7.5.0 形参：在定义函数时，函数名后面括号中的参数
   - 7.5.1 形参的作用
   - 7.5.2 形参的类型
   - 7.5.3 形参的内存空间
   - 7.5.4 形参被赋值的时机
- 7.6 函数的实参
     - 7.6.0 实参：在主调函数中调用一个函数时，函数名后面括号中的参数（可以是一个表达式）
   - 7.6.1 实参的作用
   - 7.6.2 实参的类型
- 7.7 函数传参时形参和实参的类型匹配问题
   - 7.7.1 隐式转换
   - 7.7.2 显示转换
- 7.7 库函数
     - ANSI C定义的标准函数
- 第三方库函数
## 8. 作用域
- 8.1 作用域的概念和种类
   - 8.1.1 复合语句作用域
   - 8.1.2 函数作用域
   - 8.1.3 文件作用域
- 8.2 变量的作用域
   - 8.1 全局变量
       - 8.1.1 本文件的全局变量
       - 8.1.2 外部文件的全局变量
            - 声明全局变量
        - extern int g_nNum; //可以多次声明，但定义只能有一次，不能重复定义。
   - 8.2 局部变量
       - 8.2.1 函数局部变量
       - 8.2.2 复合语句局部变量
8.3 函数的作用域
   -8.3.1 本文件的函数
   -8.3.2 外部文件的函数
## 9. 生存周期
- 9.1 生存周期的概念和类型
    - 9.1.1 短命的普通局部变量
    - 9.1.2 长寿的静态局部变量
        - 静态局部变量  static int nStaticNum;
        - 改变变量的生存周期，把局部变量的生存周期给它升级为整个程序运行期间
        - 静态局部变量的特性 ：
            - 生存周期变成程序运行期间
            - 初始化只被执行一次
 
    - 9.1.3 长寿的普通全局变量
        - 在所有函数外部
    - 9.1.4 长寿但被限制作用域的静态局部变量
        - 将全局变量的作用域降低，只能在本文件中使用，其他文件不能使用;生存周期不变。
- 9.2 生存周期的影响
   - 9.2.1 变量的内存空间的使用有效期
## 10. 预处理
- 10.0 无参宏
     - 10.0.1 无参宏是指执行单一替换功能的宏定义
         ```#define PI 3.14```
- 10.1 有参
   - 10.1.1 有参宏的定义
        ```#define S(a,b) ((a)*(b)/2```
   - 10.1.2 有参宏的使用
        - 在有参宏中不要使用++  --
   - 10.1.3 有参宏的缺陷
        **只是简单的字符替换，会产生优先级的问题**
- 10.2 条件编译宏
   - 10.2.1 条件编译指令
       - 10.2.1.1 #if
       - 10.2.1.2 #else
       - 10.2.1.3 #endif
       - 10.2.1.4 #ifdef
            - 判断某个宏是否有定义
       - 10.2.1.5 #ifndef
         ```c
         //判断是否为调试方式编译
         #ifdef _DEBUG
             printf ( "This is Debug" );
         # else
             printf ( "this is relece" );
         #endif
         //判断是否为x64方式编译
         #ifdef _M_AMD64
             printf ( "this is win64" );
         # else
             printf ( "this is win32" );
         #endif
         ```      
- 10.3 特殊的宏
     - 10.3.0
        ``` c
        #pragma once
 
        #ifndef 宏的名字
        #ifdef 宏的名字  // _大写的头文件的文件名_ H
 
        #endif
        ```
 
   - 10.3.1 DEBUG
 
   - 10.3.2 _WIN64
   - 10.3.3 __LINE__
        - __LINE__宏得到一个对应当前行号整数常量。
    - 10.3.4 __FUCTION__
        - 使用__func__标识符总是可以获得代码中表示函数体的函数名。
            ``` c
 
            void print_the_name(void){printf("%s was called.\n", __func__);}
 
            ```
   - 10.3.5 __FILE__
        - __FILE__宏把当前源文件的名称表示为一个字符串常量，一般是包含整个文件的路径的字符串常量"C:\\EE\|main.c"
   - 10.3.6 __TIME__
        - __TIME__提供包含日期值的字符串，格式为hh:mm:ss //编译器执行的时间，不是程序运行的时间
     - 10.3.7 __DATE_-
        - __DATE__生成日期的字符串表示法，在程序调用它时，它的格式是Mmm dd yyy。
 
 
 
## 11. 一级指针
- 11.0 本质、两个运算符
     - 指针本质上只是4个字节（一个字节8位）的变量，这个变量对应的一个内存地址。(内存地址用8位16进制数表示0x00000000 32位2进制数)（）
     - &：取地址，获取一个变量的内存地址
     - *：  解引用，取出一个内存地址上的值
     - 注意：在定义一个指针的时候 * 号只是起一个标志的作用
- 11.1 一级指针的类型
     - 确定取地址的时候取多长
     - ```n1 = 0;```
     - ```n1 = *((char*)pNum); //强制类型转换把int*转化char* 本来int*是取4个字节，现在变为char* 仅仅取一个字节```
- 11.2 一级指针的定义
     - 数据类型 *指针名;
     - 例： ```int *pNum = NULL; //定义了一个名为pNum的int型指针变量，并初始化为空。```
- 11.3 一级指针的赋值
     - ```*p = 200;```
- 11.4 一级指针的使用
- 11.4.1 指针的指向
- 指向的是一段内存地址
        - 例：
        ``` c
        int a = 42;
        int* pNum = &a; //pNum是一个整型变量，a是一个int型变量
        printf("%p", pNum); //打印的pNum这个int*变量上保存的int型变量a的内存地址0x00000000;
        //打印出来的结果与printf("%p",&a);一样
        ```
- 11.4.2 指针指向的内容
        - 该内存地址上实际保存的值
        - 例： ```*pNum = 42;//pNum是一个int型指针变量，把pNum指向的内存地址上的值改为42.```
 
- 11.5 函数形参和指针的配合使用
- 11.5.1 在函数内通过形参修改实参的值.
        ``` c
        void swap(int* px, int* py)
        {
            int* temp = *px;
            *px = *py;
            *py = *temp;
        }
        int main()
        {
            int x = 1, y = 2;
            swap(&x, &y);
            return 0;
        }
        ```
- 11.5.2 使用指针传递更大的内存空间.
- 11.6 野指针
- 11.6.1 野指针的形成
- 11.6.2 野指针的危害
- 11.7 空指针
- 11.7.1 空指针的形成
        指向NULL的指针
- 11.7.2 空指针的危害
- 11.8 悬空指针
- 11.8.1 悬空指针的形成
- 11.8.2 悬空指针的危害
- 11.9 类型的变化规律：
    - 对变量取地址，得到的是地址，类型为一级指针类型
    - 数组名，也是一级指针类型
    - 对一级指针解引用，得到的是相应的数据类型
    - 一级指针类型使用下标运算符，得到的是相应的数据类型
        ``` c
        //例如：
        int a[] = {1,2,3,4,5};
        int *p = a;
        a+2, &a[2], p+2, &p[2]表示的同一个一级指针类型的同一地址
        *(a+2), *&a[2], *(p+2), *&p[2]表示int型，数据是a[2];
        ```
 
## 12. 结构体struct
- 12.1 结构体的定义(struct)
    ``` c
    sttuct{
 
    }mperson;
 
    struct Mystruct{
        .........
    }mystruct;
    struct MyStruct{
        类型名1  成员名1;
        ......
        类型名n  成员名n;
    };
    MyStruct stc1; //定义结构体变量stc1.
    例：
    struct _PERSON{
        char name[20];
        char sex;
        int age;
        float height;
    };
     _PERSON mperson; //定义了一个_ PERSON类型的mperson的变量
 
    struct{
 
    }mperson;
 
    struct _PERSON{
 
    }mperson;
    ```
 
- 12.2结构体的字段
 
- 12.2.1 字段的类型
- 12.3 使用结构体定义变量
- 12.4 结构体变量的初始化
- 12.4.1 部分字段的初始化
        只初始化给出的值对应的字段，没有对应的值会被默认初始化为0;
- 12.4.2 全部字段的初始化
    ``` c
    struct _PERSON{
    char name[20];
    wchar_t sex;
    int age;
    }per[3] = {
        {'张三'，男, 23},
        {'zzz', 男, 46},
        {'aaa', 女, 26}
    };
    ```
- 12.5 使用结构体字段
- 12.5.1 `.` 运算符
 
- 12.5.2 `->` 运算符
    - 指针形式访问结构体字段需要使用->运算符（相当与'*.'）
- 12.6 在函数中接收结构体变量
- 12.6.1 函数传递结构体变量实参和形参的传递方式
    - 结构体指针：
    - 结构体数组
        _PERSON* pmperson = NULL;
        pmperson = &mperson;
- 12.7 结构体嵌套
 
- 12.8 结构体变量的内存空间
    - 等于结构体内各字段的和。sizeof(_PERSON);
- 12.9 结构体内存空间计算方式
- 12.9.1 结构体对齐
 
 
- 12.10 位段
- 12.10.1 位段的定义形式
- 12.10.2 位段的大小限制
## 13. 联合体union
- 13.1 联合体的定义(union)
    ``` c
    union Ip
    {
        struct {
        unsigned char ip1;
        unsigned char ip2;
        unsigned char ip3;
        unsigned char ip4;
        }IPBIT;
    }ipPoj;
    ```
- 13.2 联合体的字段
- 13.3 联合体的内存空间
- 13.4 联合体变量的内存空间计算方式
- 13.5 与结构体的异同
 
    联和体与结构体在使用形式上都是一致的，唯一的区别是结构体每一个成员内存空间都是独立的，联合体所有的成员都共用一块内存空间。
    由于联合体类型的成员变量使用的是共用内存空间，因此联合体变量中起作用的总是最后一次存放的成员变量的值。
## 14. 枚举enum
- 14.1 枚举的作用
- 14.2 枚举的定义
- 14.3 枚举的使用
## 15. 堆空间
- 15.1 堆空间的申请函数
    - 15.1.1 malloc
 
        刚刚分配的动态内存的初始值是不确定的.
        ``` c
        void* malloc( _In_ size_t _size);
        //例：
        void *p = NULL;
        p = malloc(10);
        free(p);
        ```
     - 15.1.2 calloc
 
        根据元数个数元素字节数分配堆空间，分配后将堆空间初始化为0
     - 15.1.3 realloc
 
        根据旧的空间分配新空间，分配后，将旧的空间内容拷贝到新空间中。
- 15.2 内存释放函数free
 
    ***不能对同一指针(地址)连续两次进行free操作。***    
 
    ***注意：*** 定义变量时坚持对其进行正确的初始化。
 
    ***在用free或delete释放内存之后，应及时将相应的指针置为NULL。***
- 15.3 悬空指针
 
    一个指针变量，如果不为NULL且没有指向指向有效的内存地址，称为“悬空指针”，通过悬空指针访问其指向的内存区会使程序产生不可预知的错误。
- 15.4 内存操作函数
     - 15.4.1 内存填充函数memset
     - 15.4.2 内存拷贝函数memcpy
     - 15.4.3 内存比较函数memcmp
     - 15.4.4 内存移动函数memmove
- 15.5 堆空间生存周期
- 15.6 内存泄漏
 
    使用完一个指针后，如果没有进行释放，让其又指向了其它内存地址，
    这样就造成了内存泄漏
## 16. 程序的内存空间布局
- 16.1 堆区
 
    程序中动态分配的内存都存储在堆区
- 16.2 栈区
 
 
    大部分函数的形参和局部变量
- 16.3 静态数据区
 
    全局变量、用static修饰的局部变量
- 16.4 常量数据区
 
    字符串常量
- 16.5 代码区
 
    程序指令和大部分字面常量
- 16.6 CPU寄存器组
 
    一小部分函数形参和局部变量
- 16.7 生存周期
    - 16.7.1 静态生存期
 
## 17. 高级指针
- 17.0 指针的算术运算
     - 只能进行加法或减法运算
- 两种形式：
    - 1、指针+-整数：得到指针下移或者上移存储单元个数之后的内存地址。存储单元的大小就是该指针的数据类型所需的内存大小
    - 2、指针-指针：指针与指针的减运算要求相减的两个指针属于同一类型，其结果是整数，表示两个指针之间的数据的个数，并非两个地址的差值。
- 17.1 保存变量的指针
    - 17.1.1 基本数据类型变量的指针
        - 17.1.2 结构体/联合体变量的指针
- 17.2 保存数组的指针
    - 17.2.1 保存一维数组的指针
        - 数组名是数组类型的常量
        - 数组名，为数组的起始地址，可以隐式的转换成数组所存储元素的指针类型
        ``` c
        int arr[] = {1,2,3,4,5};
        int *p = arr;  //可以隐式的转换成一级指针类型0
        printf("%s", typeid(a).name()); //查看对象类型_
        //typeid 是一个c++的关键字
        ```
    - 17.2.2 保存二维数组的指针
        - 二维数组指针
        - 二维数组名是一个指针类型，叫做一维数组指针类型
        - 类型名　（ *变量名）[数组长度] *例如：* int (*p)[4];
        - 注意：对于数组指针，应该给出所指向数组的长度
        ```c
        int a[3][4];
        int (*p)[4];
        p = a;  //这里的a或p的类型是int (*)[4]
        ```
        - 类型变化规律：
            - 对于一维数组指针解引用会降维，变成1级指针。
            - 对一维数组指针使用下标运算符也会降维，变成1级指针。
            - 对于一维数组指针，会得到下一排起始地址，类型还是数组指针
            - 对于一维数组名取地址，会变为二维数组指针，数值不变。**对于int a[3]; &a的类型为int (*)[3]**
            ``` C
            //例如：
            int a[3][4]  =
            {
               {1,2,3,4},
               {5,6,7,8},
               {9,10,11,12},
            };
            //a[i]和*(a+i)等价，都是第i行第0列元素的地址，
            //那么a[i]+j  *(a+i)+j  &a[0][0]+4*i+j都是第i行第j列元素的地址。
            ```
        - 指针数组与二维数组的区别
            ``` C
            //指针数组   
            char *color[] //color是一个指针，指向char []
 
            //二维数组  
            char color2[3][6] //color2是一个数组，含有3个元素，每个元素都是一个char[6]
            ```
            **指针数组存储的是指针，二维数组存储的是数据**
 
    - 17.2.3 指针与多维数组
        - 多维数组指的是一维以上的数组，其数组名为多维数组指针类型。
        - 多维数组指针
        - 例如： Array[2][3][4][5] = {1,2,3,4,5,6,7,8,9,10,11,12,13,14};
        - 转换规律：
        - 对多维数组指针解引用会降维，变成降一维的数组指针，直到降成一级指针。
        - 对数组指针使用下标运算符也会降维，直到降维成一级指针。
        - 对于数组指针+1，会得到下一个数组的起始地址，类型不变。
        - 对多维数组名取地址，会变为更高维度的数组指针，数值不变。
- 17.3 **指针数组与数组指针**
    - 指针数组：
    - 指针数组就是其元指针的数组
    - 每一个元素都是指针变量
    - 数据类型　*指针数组名[常量表达式];
    - ` int *p[6];`
    ``` c
    int *p[ 6 ]; //p是指针数组，其中的元素为指针
    int (*p1)[6]; //p1是数组指针，p是一个指针，它指向一个int型的数组，这个数组的含有6个int。
    ```
    - 指针数组内存储的数据可以是任意指针类型。
    ``` C
    int *p[5];   //一级指针数组
    int **p[5];  //二级指针数组
    int (*p2[5])[10] //数组指针数组，p2是一个数组，这个数组有10个元素，每个元素都是一    个数组指针,指针指向的是一个int[5]的数组
    ```
 
- 17.4 保存指针的指针
    - 17.4.1 多级指针
        - 二级指针
        - 指针变量是用来存储地址的变量
        - 二级指针是用来存储指针的地址的变量
        - ```int x = 100; int *p = &x; int **pp = &p;```
- 17.5 保存函数的指针
    - 17.5.1 函数指针
        ``` c
        //函数指针类型，它可以使得你用一个变量存储一个函数的地址 ，并且能够执行它
        //函数指针是指向函数的指针变量
        void test(int n)
        {
            printf("test %d...\n", n);
        }
        void (*f)(int);  //这里的f就是函数指针变量
        f = &test;   //等价于f = test;
        (*f)(100);   //等价于f(100)
 
        //例 typedef int (*PFUN)(int);
        ```
 
- 17.6 保存数组的指针的变种
    - 17.6.1 指针数组的指针
        - 17.6.1.1 保存指针的数组的指针.
            ``` c
            int* (*p)[5][2]
 
            int (*pArr5[5])[3];  // 数组指针的数组
            int* pArr[ 5 ][3]; //指针数组的指针
            ```
    - 17.6.2 函数指针数组的指针
         - 17.6.2.1 保存函数地址的数组的指针
         ```int (*(*PFUN)(int))[10]```
    - 17.6.3 数组指针数组的指针
        - 17.6.3.1 保存数组的指针的数组的指针
        ```int (*(*pArr)[10][5])```
## 18. 文件操作
- 18.0 FILE文件结构体类型
    - c语言在stdio.h中定义了一个FILE文件结构体类型，包含管理和控制文件所需要的各种信息。在c程序中系统对文件进行的各种操作是通过指向文件结构体的指针变量来实现的。
    ``` c
    FILE *指针变量名;
    FILE *fpFile;
    //fpFile是可以指向一个FILE文件结构体的指针变量，文件指针变量的复制操作是由打开文件 函数fopen()实现的。
    ```
- 18.1 文件访问的基本模式
    ``` c
    fopen: 打开文件，获得对此文件的指针、引用和句柄等，以证明可以使用此文件
    fread: 读取文件。参数一般要指明读多少字节，读到把哪块内存。每次调用此功能，都是接    着上次调用的结束位置。（所以是个输入流）
    fwrite: 写入文件。参数一般指明把哪块内存写入文件，要写多少字节。每次调用此功能，都   是接着上次调用的借宿位置写。（所以是个输入流）
    fclose: 关闭文件，表明操作结束，不在使用此文件。文件使用完毕必须关闭，否则影响系统性能。
    fseek: 随机控制流的当前位置，文件定位。
    feof: 检查文件指针是否到达文件的结束位置。
    ```
- 18.2 文件操作
 
    - 18.2.1 打开文件操作
        - FILE *fopen(char *filename, char *mode);
        - FILE *fpFile = fopen("C:\\\test\\\File.txt", "r");
        - c语言的文件打开模式一览
            mode | 处理方式 | 文件不存在 | 文件存在
            - | - | - | -
            r | 读取 | 出错 | 打开文件
            w | 写入 | 建立新文件 | 覆盖原文件
            a | 追加 | 建立新文件 | 在原文件后追加
            r+ | 读取/写入 | 出错 | 打开文件
            w+ | 写入/读取 | 建立新文件 | 覆盖原文件
            a+ | 读取/写入 | 建立新文件 | 在原文件后追加
 
            - 以只写方式打开文件: `w`
            - 以只读方式打开文件: `r`
            - 以可读可写方式打开文件: `r+` / `w+`
            - 文件必须存在才打开文件: `r` / `r+`
            - 总是以创建新文件的方式打开文件: `w` / `w+`
            - 以续写的方式打开文件 : `a+`
            - 以覆盖的方式打开文件 : `w` / `w+`
            - 如果是二进制文件，在使用时只要在模式后面添加字符 *b* 即可，如 rb rb+
 
        - 如果由于文件不存在等原因造成不能打开文件，则调用fopen()后返回一个空指针NULL，我们可以用如下代码检查文件是否打开成功。
        ``` c
        if ((fpFile = fopen("c:\\File.txt", "r"))==NULL){
        printf("Cannot open the file. \n");
        exit(1);
        }
        //注：一般exit(0)表示程序正常退出，exit(非零值)表示程序出错后退出
 
 
    - 18.2.2 读取文件的操作
        - 18.2.2.1 从文件读取一个字符:fgetc
        ``` c
        fgetc(文件型指针变量);
        fgetc(fpFile); //返回文件当前位置的字符，并且使文件位置指针下移一个字符。如果遇到文件结束，则返回值为文件结束标志EOF。
            ```
        - 18.2.2.2 从文件读取一串字符串:fgets
 
            从文件中读一行
        - 18.2.2.3 从文件读取二进制数据:fread
        - 18.2.2.3 fscanf
        ``` c
        fscanf(文件型指针变量，格式控制，输出列表);
        fscanf(fpFile, "%ld,%s", &num, name); //从文件的当前位置按照%ld %s的格式取出数据，赋值给变量num、name,fscanf文件主要用于数据文件的读写，即可以用ASCII文件也可以使用二进制文件。
        ```
    - 18.2.3 写入文件的操作
        - 18.2.3.1 将一个字符写入到文件:fputc
        ``` c
        fputc(字符， 文件指针变量);
        fputc('A', fpFile);  //向文件的当前位置写入一个字符'A',并且使文件位置指针下移一个字节，写入成功返回值是该字符，否则返回EOF
        ```
        - 18.2.3.2 将字符串写入到文件:fputs
        ``` c
        fputs(字符型, 文件型指针变量);
        fputs("hello", fpFile); //其中字符串可以是字符串常量、指向字符串的指针变量、存放字符串的数组名，写入文件成功，返回0，否则为EOF。
        注意：字符串结束标志\0不写入
        fputs("hello", fpFile);//将h e l l o写入文件指针的当前位置。
        ```
        - 18.2.3.3 将内存中的数据写入到文件:fwrite
        ``` c
        fwrite(存放地址， 大小， 数据块个数， 文件型指针变量);
        //如果函数fwrite操作成功，则返回值为实际写入文件的数据块个数
        例如，已知struct student类型数据stu[20],则语句
        fwrite(&stu[1], sizeof(struct student), 2, fp);
        //从结构体数组元素stu[1]存放的地址开始，以一个结构体student类型变量所占字节数为一个数据块，共写入文件类型指针fp指向的文件2个数据块，即    stu[1]、stu[2]的内容写入文件。如果操作成功，函数的返回值为2。
        ```
        - 18.2.3.4 按照指定的格式，将字符串输出到文件中：fprintf
        ``` c
        fprintf(文件型指针变量，格式控制，输出表列);
        fprintf(fpFile, "%ld,%s", num, name);//按照格式要求将数据写入文件。
        ```
    - 18.2.4 文件读写位置的操作
        - 18.2.4.1 获取文件读写位置:ftell
            ``` c
            ftell()
            //用于测试指向文件的指针的当前位置
            ftell(文件型指针变量);
            int nOffset = ftell(fpFile);
            //函数的返回值是一个长整型数，如果测试成功，则返回指向文件的指针当前指向的位置距离头文件开头的字节数，否则返回-1L。
            ```
        - 18.2.4.2 设置文件读写位置:fseek
            ``` c
            fseek()
            //将使得指向文件的指针变量指向文件的任何一个位置，实现随机读写文件
            fseek(文件型指针变量, 偏移量, 起始位置);
            fseek(fpFile, 0x123, SEEK_SET);
            //函数fseek()将以文件的起始位置为基准，根据偏移量往前或往后移动，其中偏移量是一个长整型数，表示从起始位置移动的字节数，正数表示指针往后移、负数表示指针往前移.
            //如果指针设置成功，返回值为0，否则返回非0值。
            //起始位置
            SEEK_SET:开始位置
            SEEK_CUR:当前位置
            SEEK_END:结束位置
            ```
        - 18.2.4.3 重置文件读写位置:rewind
            ``` c
            rewind()
            //将指令指向文件的指针重新指向文件的开始位置，函数无返回值
            rewind(文件型指针变量);
            rewind(fpFile);
            ```
        - 18.2.4.4 检查文件的指针是否到结束位置EOF
            ``` c     
            feof()
            用来检测一个指向文件的指针是否已经到了文件最后的结束标志EOF
            feof(文件型指针变量);
            bool bIsEnd = !feof(fpFile);
            如果文件型指针指向的文件的当前位置为EOF,则函数返回一个非零值，否则返回0值。
            ```   
    - 18.2.5 关闭文件 fclose()
        ``` c
        fclose(fpFile);
        ```
 
 
 
 
 
 
 
 
 
 
 
 
 
 
## 19. 杂项
- 头文件
- 头文件不能包含实现代码（即可执行代码）
- 头文件可以包含声明，但不能包含函数定义或初始化的全局数据。
- 函数的定义和初始化的全局数据应放在.c的源文件中。
- 可以在头文件中放置函数原型、struct类型定义、符号定义、extern语句和typedef。
     - 禁止在头文件中定义全局变量
     - 防止重复包含
 
 
- 命名方式
     - 局部变量的命名方式
     - 全局变量的命名方式
     - 函数命名方式
     - 头文件和源文件的命名
 
 
 
 
 
- 断言
- 断言是一条错误消息，在满足某个条件时输出该消息。
- 运行期断言
- assert(a == b);
- 如果a等于b，表达式的结果就是true。如果a不等于b，宏的变元就是false，程序就输出一条相关的断言消息，
然后中止，断言消息包含宏变元的文本、源文件名、行号和包含assert()的函数名。程序的中止是调用abort()
实现的，所以是不正常的结束。调用abort()时，程序会立即终止。流输出缓冲区是否刷新，打开的流是否关闭
，临时文件是否删除，都取决于c的实现方式。
- 在#include < assert . h > 语句之前定义NDEBUG符号，就可以关闭运行期断言功能 ```#define NDEBUG #include<assert.h>```
- 编译期断言
- static_assert()宏可以在编译过程中输出错误消息。该消息包括指定的字符串字面量，并根据一个表达式的值可以
确定是否生成输出，该表达式是一个编译时间常量。
- static _assert(constant_ expression, string_literal);
 
 
1. 调试要点
1. 运行程序的流程对不对
1. 是否按照想象的顺序执行
2. 分支
3. 循环

2. 时刻关注局部的变量的值。
- 只有关注值的变化，才能知道流程对不对

## 20. 控制台编程
- 控制台编程简介
- Console句柄是指当前控制台窗口的操作对象，所有字符界面相关的API都会通过操作Console句柄来完成的。
- Console句柄分两种：
- 标准输入句柄 Stand In
- 标准输出句柄 Stand Out
- 分别用于从界面中读取输入，或向界面输出内容
 
- 控制台编程
- 用于获取控制台句柄的是GetStdHandle()函数
``` c
HANDLE WINAPI GetStdHandle(
_In_ DOWRD bStdHandle
);
 
HANDLE hStdIn,hStdOut;
hStdIn = GetStdHandle(STD _INPUT_ HANDLE);
hStdOut = GetStdHandle(STD _OUTPUT_ HANDLE);
```
- 注意：
- 在程序使用完句柄后，一定不要忘记使用CloseHandle()函数关闭句柄，
- 例如：CloseHandle(hStdIn);
 
- 向控制台输内容的API是WriteConsole():
``` c
BOOL WINAPI WriteConsole(
_In_ HANDLE hConsoleOutput,  //控制台输出句
_In_ const VOID *lpBuffer,   //需输出数据的指针
_In_ DWORD nNum...ToRead,    //需输出的字符数量
_Out_ LPDWORD lpNum...Written, //实际输出的字符数量
_Reserved_ LPVOID lpReserved   //系统保留
);
 
//例如需要向控制台输出一个Hello World:
wchar_t *szStr = L"Hello World!";
DWORD dwRet;
WriteConsole(hStdOut, szStr, 12, &dwRet, NULL);
```
 
- 在控制台读取信息的API是ReadConsole():
``` c
    BOOL WINAPI ReadConsole{
        _In_ HANDLE hConsoleInput,  //控制台输入句柄
        _Out_ LPVOID lpBuffer,      //保存输入信息的缓冲区
        _In_ DWORD nNum...ToRead,   //接受数据缓冲区的大小
        _Out_ LPDWORD lpNum... ,    //实际接受数据的字节数
        _In_ opt_ LPVOID pInputControl  //输入控制
    }
    //此函数接受用户输入源为用户输入的字符信息  
```
 
 
- API函数可以设置控制台的标题
``` c
    BOOL WINAPI SetConsoleTitle(
        _In_ LPCTSTR lpConsoleTitle
    );
    //示例：
    wchar_t szStr[] = L"Console Title!"
    if (!SetConsoleTitle(szStr)){
    //控制台标题设置失败
    }
```
- 重置窗口位置和大小的API
``` c
    BOOL WINAPI SetConsoleWindowInfo(
        _In_ HANDLE hConsoleOutput,     //控制台输出句柄
        _In_ BOOL bAbsolute,        //是否为绝对坐标
        _In_ const SMALL_RECT *lpC...Window     //新窗口坐标信息
    );
    //示例
    //将窗口大小设置为80*40;
    SMALL_RECT srctWindow = {0,0,80-1,40-1};
    if(!SetConleWindowInfo(hStdOut,true,&srctWindow))
    {
        //设置控制台窗口大小失败
    }
```
- 设置窗口缓冲区大小的API
``` c
    BOOL WINAPI SetConsoleScreenBufferSize(
        _In_ HANDLE hConsoleOutput,     //输出句柄
        _In_ COORD dwSize       //缓冲区大小
    );
    //示例：
    //将窗口缓冲区设为80*40：
    COORD BufferSize = {80，40};
    if(!SetConsoleScreenBufferSize(hStdOut,BufferSize))
    {
        //设置控制台窗口缓冲区失败
    }
```
 
 
- 在指定位置处插入指定数量的字符
``` c
    BOOL WINAPI WriteConsoleOutputCharacter(
        _In_ HANDLE hConsoleOutput,     //控制台输出句柄
        _In_ LPCTSTR lpCharacter,   //输出的字符串
        _In_ DWORD nLength,     //输出长度
        _In_ COORD dwWriteCoord, //输出坐标
        _Out_ LPDWORD lpNum...   //实际输出长度
    );
    //示例
    //在坐标为20，20处输出一个字符串：
    wchar_t szStr[15] = L"Hello World!";
    COORD pos = {20,20};
    if (!WriteConsoleOutputCharacter(hStdOut,szStr,15,pos,&dwRet))
    {
        //在指定位置输出字符串失败
    }
```
 
- 设定指定字符的属性
``` c
    BOOL WINAPI WriteConsoleOutputAttribute(
        _In_ HANDLE hConsoleOutputAttribute,    //控制台输出句
        _In_ const WORD *lpAttribute,   //字符属性
        _In_ DWORD nLength, //改变字符属性的长度
        _In_ COORD dwWriteCoord,    //起始设置属性的坐标
        _Out_ LPDWORD lpNumber...  .//实际输出长度
    )
    //示例
    //在坐标为20，20处设定一个字符串的显示属性
    COORD pos = {20, 20};
    WORD wClr[10];
    wmemset((wchar _t*) wClr, FOREGROUND_ GREEN, 10);
    if(!WriteConsoleOutputAttribute(hStdOut, wClr,8,pos,&dwRet)){
            //在指定位置设置字符串颜色失败
    }
```
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
杂记
 
 
 
```c
char buffer[] = "this is a test of the memset function";
char buffer1[] = "hello world hello world";
printf("before:%s\n", buffer);
 
memset(buffer, '*', 2);
buffer[5] = '*';
printf("after: %s\n", buffer);
memcpy(buffer1, buffer, 5);
printf("%s\n", buffer1);
```
 
```c
qsort, qsort_s
C 算法
定义于头文件 <stdlib.h>
void qsort( void *ptr, size_t count, size_t size,
int (*comp)(const void *, const void *) );
(1)
errno_t qsort_s( void *ptr, rsize_t count, rsize_t size,
int (*comp)(const void *, const void *, void *),
void *context );
(2) (C11 起)
1) 对ptr所指向的数组以升序排序。数组包含count个长度为size字节的元素。comp所指的函数用于比较对象。
2) 同(1)，除了传递给comp附加语境参数context，还会在运行时检测下列错误，并调用当前安装的制约处理函数：
count或size大于RSIZE_MAX
key、 ptr或comp是空指针（除非count为零）
同所有边界检查函数， qsort_s 仅在实现定义了 __STDC_LIB_EXT1__ ，且用户在包含 stdlib.h 前定义 __STDC_WANT_LIB_EXT1__ 为整数常量 1 的情况保证可用。
若comp指示两元素相等，则它们排序后的结果是未定义的。
 
参数
ptr -   指向待排序的数组的指针
count   -   数组的元素数目
size    -   数组每个元素的字节大小
comp    -   比较函数。若首个参数小于第二个，则返回负整数值，若首个参数大于第二个，则返回正整数值，若两参数相等，则返回零。
比较函数的签名应等价于如下形式：
 
int cmp(const void *a, const void *b);
 
该函数必须不修改传递给它的对象，而且在调用比较相同对象时必须返回一致的结果，无关乎它们在数组中的位置。
 
 
 
context -   附加信息（例如，对照序列），作为第三个参数传递给comp
返回值
1) （无）
2) 成功时为零，若检测到运行时强制违规，则为非零
注意
与名称无关，C和POSIX标准都未要求此函数用快速排序实现，也未保证任何复杂度或稳定性。
 
与其他边界检查函数不同，qsort_s不将零大小数组视作运行时强制违规，而是不修改数组并成功返回（另一个接受零大小数组的函数是bsearch_s）。
 
在qsort_s之前，qsort的用户通常用全局变量来将附加语境传递给比较函数。
 
示例
#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
int compare_ints(const void* a, const void* b)
{
int arg1 = *(const int*)a;
int arg2 = *(const int*)b;
if (arg1 < arg2) return -1;
if (arg1 > arg2) return 1;
return 0;
// return (arg1 > arg2) - (arg1 < arg2); // 可行的简洁写法
// return arg1 - arg2; // 错误的简洁写法（若给出INT_MIN则会失败）
}
int main(void)
{
int ints[] = { -2, 99, 0, -743, 2, INT_MIN, 4 };
int size = sizeof ints / sizeof *ints;
qsort(ints, size, sizeof(int), compare_ints);
for (int i = 0; i < size; i++) {
printf("%d ", ints[i]);
}
printf("\n");
}
输出：
 
-2147483648 -743 -2 0 2 4 99
 
```