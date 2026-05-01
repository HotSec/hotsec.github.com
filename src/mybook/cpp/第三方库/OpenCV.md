# OpenCV 教程

## 1. OpenCV 概述

OpenCV（Open Source Computer Vision Library）是一个开源的计算机视觉和机器学习库，提供超过 2500 个优化算法。

### 1.1 核心模块

| 模块 | 说明 |
|------|------|
| core | 核心数据结构（Mat、Scalar、Rect 等） |
| imgproc | 图像处理（滤波、几何变换、颜色空间转换） |
| imgcodecs | 图像文件读写 |
| highgui | GUI 和图像显示 |
| video | 视频分析（光流、目标跟踪） |
| videoio | 视频文件读写 |
| objdetect | 目标检测（人脸、行人） |
| dnn | 深度学习推理 |
| features2d | 特征检测与描述（SIFT、SURF、ORB） |
| calib3d | 相机标定和 3D 重建 |
| ml | 机器学习算法 |
| photo | 计算摄影学（去噪、HDR） |

### 1.2 安装

```bash
# macOS
brew install opencv

# Ubuntu
sudo apt install libopencv-dev python3-opencv

# vcpkg
vcpkg install opencv4

# CMake 集成
find_package(OpenCV REQUIRED)
target_link_libraries(MyApp PRIVATE ${OpenCV_LIBS})
```

## 2. 基础操作

### 2.1 图像读写与显示

```cpp
#include <opencv2/opencv.hpp>

int main() {
    cv::Mat img = cv::imread("input.jpg", cv::IMREAD_COLOR);
    if (img.empty()) {
        std::cerr << "无法加载图像" << std::endl;
        return -1;
    }

    std::cout << "图像尺寸: " << img.cols << "x" << img.rows << std::endl;
    std::cout << "通道数: " << img.channels() << std::endl;
    std::cout << "类型: " << img.type() << std::endl;

    cv::namedWindow("Display", cv::WINDOW_AUTOSIZE);
    cv::imshow("Display", img);
    cv::waitKey(0);

    cv::imwrite("output.jpg", img);

    return 0;
}
```

### 2.2 读取模式

```cpp
cv::Mat colorImg = cv::imread("image.jpg", cv::IMREAD_COLOR);       // BGR 3通道
cv::Mat grayImg = cv::imread("image.jpg", cv::IMREAD_GRAYSCALE);    // 灰度 1通道
cv::Mat alphaImg = cv::imread("image.png", cv::IMREAD_UNCHANGED);   // 包含 alpha 通道
cv::Mat halfImg = cv::imread("image.jpg", cv::IMREAD_REDUCED_COLOR_2); // 缩小2倍
```

### 2.3 Mat 矩阵操作

```cpp
void matOperations() {
    cv::Mat mat1(3, 3, CV_8UC3, cv::Scalar(0, 0, 255));

    cv::Mat mat2 = cv::Mat::zeros(3, 3, CV_8UC1);
    cv::Mat mat3 = cv::Mat::ones(3, 3, CV_32FC1);
    cv::Mat mat4 = cv::Mat::eye(3, 3, CV_32FC1);

    cv::Mat mat5 = (cv::Mat_<float>(3, 3) << 1, 0, 0,
                                                  0, 1, 0,
                                                  0, 0, 1);

    cv::Mat clone = mat1.clone();
    cv::Mat copy;
    mat1.copyTo(copy);

    cv::Mat roi = mat1(cv::Rect(0, 0, 2, 2));

    cv::Mat row = mat1.row(0);
    cv::Mat col = mat1.col(1);
    cv::Mat range = mat1(cv::Range(0, 2), cv::Range(0, 2));

    cv::Size size = mat1.size();
    int total = mat1.total();
    bool empty = mat1.empty();
    int depth = mat1.depth();
    int channels = mat1.channels();
}
```

### 2.4 像素访问

```cpp
void pixelAccess() {
    cv::Mat img = cv::imread("input.jpg");

    // 方式1：at 方法（较慢，有边界检查）
    cv::Vec3b pixel = img.at<cv::Vec3b>(y, x);
    uchar blue = pixel[0];
    uchar green = pixel[1];
    uchar red = pixel[2];
    img.at<cv::Vec3b>(y, x) = cv::Vec3b(255, 255, 255);

    // 方式2：ptr 方法（较快）
    for (int y = 0; y < img.rows; y++) {
        cv::Vec3b *row = img.ptr<cv::Vec3b>(y);
        for (int x = 0; x < img.cols; x++) {
            row[x] = cv::Vec3b(255 - row[x][0],
                                255 - row[x][1],
                                255 - row[x][2]);
        }
    }

    // 方式3：迭代器
    for (auto it = img.begin<cv::Vec3b>(); it != img.end<cv::Vec3b>(); ++it) {
        *it = cv::Vec3b(255 - (*it)[0], 255 - (*it)[1], 255 - (*it)[2]);
    }

    // 方式4：连续内存快速访问
    if (img.isContinuous()) {
        int totalPixels = img.rows * img.cols * img.channels();
        uchar *data = img.data;
        for (int i = 0; i < totalPixels; i++) {
            data[i] = 255 - data[i];
        }
    }
}
```

## 3. 图像处理

### 3.1 颜色空间转换

```cpp
void colorConversion() {
    cv::Mat bgr = cv::imread("input.jpg");

    cv::Mat gray;
    cv::cvtColor(bgr, gray, cv::COLOR_BGR2GRAY);

    cv::Mat hsv;
    cv::cvtColor(bgr, hsv, cv::COLOR_BGR2HSV);

    cv::Mat rgb;
    cv::cvtColor(bgr, rgb, cv::COLOR_BGR2RGB);

    cv::Mat lab;
    cv::cvtColor(bgr, lab, cv::COLOR_BGR2Lab);

    cv::Mat ycrcb;
    cv::cvtColor(bgr, ycrcb, cv::COLOR_BGR2YCrCb);
}
```

### 3.2 几何变换

```cpp
void geometricTransforms() {
    cv::Mat src = cv::imread("input.jpg");

    cv::Mat resized;
    cv::resize(src, resized, cv::Size(640, 480));
    cv::resize(src, resized, cv::Size(), 0.5, 0.5, cv::INTER_LINEAR);

    cv::Mat rotated;
    cv::Point2f center(src.cols / 2.0f, src.rows / 2.0f);
    cv::Mat rotMatrix = cv::getRotationMatrix2D(center, 45.0, 1.0);
    cv::warpAffine(src, rotated, rotMatrix, src.size());

    cv::Mat flipped;
    cv::flip(src, flipped, 1);  // 1=水平翻转, 0=垂直翻转, -1=双向

    cv::Mat translated;
    float data[6] = {1, 0, 100, 0, 1, 50};
    cv::Mat transMatrix = cv::Mat(2, 3, CV_32F, data);
    cv::warpAffine(src, translated, transMatrix, src.size());

    cv::Point2f srcPts[4] = {
        cv::Point2f(0, 0),
        cv::Point2f(src.cols - 1, 0),
        cv::Point2f(src.cols - 1, src.rows - 1),
        cv::Point2f(0, src.rows - 1)
    };
    cv::Point2f dstPts[4] = {
        cv::Point2f(50, 50),
        cv::Point2f(src.cols - 100, 30),
        cv::Point2f(src.cols - 50, src.rows - 50),
        cv::Point2f(30, src.rows - 80)
    };
    cv::Mat perspMatrix = cv::getPerspectiveTransform(srcPts, dstPts);
    cv::Mat warped;
    cv::warpPerspective(src, warped, perspMatrix, src.size());
}
```

### 3.3 图像滤波

```cpp
void filtering() {
    cv::Mat src = cv::imread("input.jpg");

    cv::Mat blurred;
    cv::blur(src, blurred, cv::Size(5, 5));

    cv::Mat gaussian;
    cv::GaussianBlur(src, gaussian, cv::Size(5, 5), 1.5);

    cv::Mat median;
    cv::medianBlur(src, median, 5);

    cv::Mat bilateral;
    cv::bilateralFilter(src, bilateral, 9, 75, 75);

    cv::Mat kernel = (cv::Mat_<float>(3, 3) <<
        0, -1, 0,
       -1,  5, -1,
        0, -1, 0);
    cv::Mat sharpened;
    cv::filter2D(src, sharpened, -1, kernel);

    cv::Mat boxFiltered;
    cv::boxFilter(src, boxFiltered, -1, cv::Size(5, 5));
}
```

### 3.4 形态学操作

```cpp
void morphology() {
    cv::Mat src = cv::imread("input.jpg", cv::IMREAD_GRAYSCALE);
    cv::Mat binary;
    cv::threshold(src, binary, 128, 255, cv::THRESH_BINARY);

    cv::Mat kernel = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(5, 5));

    cv::Mat eroded;
    cv::erode(binary, eroded, kernel);

    cv::Mat dilated;
    cv::dilate(binary, dilated, kernel);

    cv::Mat opened;
    cv::morphologyEx(binary, opened, cv::MORPH_OPEN, kernel);

    cv::Mat closed;
    cv::morphologyEx(binary, closed, cv::MORPH_CLOSE, kernel);

    cv::Mat gradient;
    cv::morphologyEx(binary, gradient, cv::MORPH_GRADIENT, kernel);

    cv::Mat tophat;
    cv::morphologyEx(binary, tophat, cv::MORPH_TOPHAT, kernel);

    cv::Mat blackhat;
    cv::morphologyEx(binary, blackhat, cv::MORPH_BLACKHAT, kernel);
}
```

### 3.5 边缘检测

```cpp
void edgeDetection() {
    cv::Mat src = cv::imread("input.jpg", cv::IMREAD_GRAYSCALE);

    cv::Mat blurred;
    cv::GaussianBlur(src, blurred, cv::Size(3, 3), 0);

    cv::Mat canny;
    cv::Canny(blurred, canny, 50, 150);

    cv::Mat sobelX, sobelY, sobel;
    cv::Sobel(blurred, sobelX, CV_32F, 1, 0, 3);
    cv::Sobel(blurred, sobelY, CV_32F, 0, 1, 3);
    cv::magnitude(sobelX, sobelY, sobel);
    cv::convertScaleAbs(sobel, sobel);

    cv::Mat laplacian;
    cv::Laplacian(blurred, laplacian, CV_32F, 3);
    cv::convertScaleAbs(laplacian, laplacian);
}
```

### 3.6 阈值处理

```cpp
void thresholding() {
    cv::Mat gray = cv::imread("input.jpg", cv::IMREAD_GRAYSCALE);

    cv::Mat binary;
    cv::threshold(gray, binary, 128, 255, cv::THRESH_BINARY);

    cv::Mat binaryInv;
    cv::threshold(gray, binaryInv, 128, 255, cv::THRESH_BINARY_INV);

    cv::Mat trunc;
    cv::threshold(gray, trunc, 128, 255, cv::THRESH_TRUNC);

    cv::Mat tozero;
    cv::threshold(gray, tozero, 128, 255, cv::THRESH_TOZERO);

    cv::Mat adaptiveMean;
    cv::adaptiveThreshold(gray, adaptiveMean, 255,
                          cv::ADAPTIVE_THRESH_MEAN_C,
                          cv::THRESH_BINARY, 11, 2);

    cv::Mat adaptiveGauss;
    cv::adaptiveThreshold(gray, adaptiveGauss, 255,
                          cv::ADAPTIVE_THRESH_GAUSSIAN_C,
                          cv::THRESH_BINARY, 11, 2);

    cv::Mat otsu;
    double thresh = cv::threshold(gray, otsu, 0, 255,
                                  cv::THRESH_BINARY | cv::THRESH_OTSU);
}
```

## 4. 特征检测

### 4.1 轮廓检测

```cpp
void contourDetection() {
    cv::Mat src = cv::imread("input.jpg", cv::IMREAD_GRAYSCALE);
    cv::Mat binary;
    cv::threshold(src, binary, 128, 255, cv::THRESH_BINARY);

    std::vector<std::vector<cv::Point>> contours;
    std::vector<cv::Vec4i> hierarchy;
    cv::findContours(binary, contours, hierarchy,
                     cv::RETR_EXTERNAL, cv::CHAIN_APPROX_SIMPLE);

    cv::Mat result = cv::Mat::zeros(src.size(), CV_8UC3);
    for (size_t i = 0; i < contours.size(); i++) {
        double area = cv::contourArea(contours[i]);
        double perimeter = cv::arcLength(contours[i], true);

        if (area < 100) continue;

        cv::drawContours(result, contours, i, cv::Scalar(0, 255, 0), 2);

        cv::Moments m = cv::moments(contours[i]);
        cv::Point center(m.m10 / m.m00, m.m01 / m.m00);
        cv::circle(result, center, 4, cv::Scalar(0, 0, 255), -1);

        cv::Rect boundingRect = cv::boundingRect(contours[i]);
        cv::rectangle(result, boundingRect, cv::Scalar(255, 0, 0), 2);

        cv::RotatedRect minRect = cv::minAreaRect(contours[i]);
        cv::Point2f rectPoints[4];
        minRect.points(rectPoints);
        for (int j = 0; j < 4; j++) {
            cv::line(result, rectPoints[j], rectPoints[(j + 1) % 4],
                     cv::Scalar(0, 255, 255), 2);
        }

        cv::RotatedRect minEllipse = cv::fitEllipse(contours[i]);
        cv::ellipse(result, minEllipse, cv::Scalar(255, 0, 255), 2);
    }
}
```

### 4.2 角点检测

```cpp
void cornerDetection() {
    cv::Mat src = cv::imread("input.jpg", cv::IMREAD_GRAYSCALE);

    cv::Mat harrisCorners;
    cv::cornerHarris(src, harrisCorners, 2, 3, 0.04);
    cv::Mat harrisNorm;
    cv::normalize(harrisCorners, harrisNorm, 0, 255, cv::NORM_MINMAX, CV_32FC1);

    cv::Mat result;
    cv::cvtColor(src, result, cv::COLOR_GRAY2BGR);
    for (int y = 0; y < harrisNorm.rows; y++) {
        for (int x = 0; x < harrisNorm.cols; x++) {
            if (harrisNorm.at<float>(y, x) > 200) {
                cv::circle(result, cv::Point(x, y), 5, cv::Scalar(0, 0, 255), 2);
            }
        }
    }

    std::vector<cv::Point2f> corners;
    cv::goodFeaturesToTrack(src, corners, 100, 0.01, 10);
    for (const auto &corner : corners) {
        cv::circle(result, corner, 5, cv::Scalar(0, 255, 0), -1);
    }
}
```

### 4.3 特征匹配

```cpp
void featureMatching() {
    cv::Mat img1 = cv::imread("image1.jpg", cv::IMREAD_GRAYSCALE);
    cv::Mat img2 = cv::imread("image2.jpg", cv::IMREAD_GRAYSCALE);

    auto orb = cv::ORB::create(500);

    std::vector<cv::KeyPoint> kp1, kp2;
    cv::Mat desc1, desc2;
    orb->detectAndCompute(img1, cv::noArray(), kp1, desc1);
    orb->detectAndCompute(img2, cv::noArray(), kp2, desc2);

    auto bfMatcher = cv::DescriptorMatcher::create(cv::DescriptorMatcher::BRUTEFORCE_HAMMING);
    std::vector<cv::DMatch> matches;
    bfMatcher->match(desc1, desc2, matches);

    std::sort(matches.begin(), matches.end());
    std::vector<cv::DMatch> goodMatches(matches.begin(),
                                         matches.begin() + std::min(50, (int)matches.size()));

    cv::Mat matchResult;
    cv::drawMatches(img1, kp1, img2, kp2, goodMatches, matchResult);

    // FLANN 匹配（SIFT/SURF）
    auto sift = cv::SIFT::create(500);
    sift->detectAndCompute(img1, cv::noArray(), kp1, desc1);
    sift->detectAndCompute(img2, cv::noArray(), kp2, desc2);

    auto flannMatcher = cv::DescriptorMatcher::create(cv::DescriptorMatcher::FLANNBASED);
    std::vector<std::vector<cv::DMatch>> knnMatches;
    flannMatcher->knnMatch(desc1, desc2, knnMatches, 2);

    std::vector<cv::DMatch> goodFlannMatches;
    for (const auto &match : knnMatches) {
        if (match[0].distance < 0.7f * match[1].distance) {
            goodFlannMatches.push_back(match[0]);
        }
    }
}
```

## 5. 目标检测

### 5.1 Haar 级联人脸检测

```cpp
void faceDetection() {
    cv::Mat img = cv::imread("photo.jpg");

    auto faceCascade = cv::CascadeClassifier();
    if (!faceCascade.load(cv::samples::findFile("haarcascade_frontalface_default.xml"))) {
        std::cerr << "无法加载级联分类器" << std::endl;
        return;
    }

    cv::Mat gray;
    cv::cvtColor(img, gray, cv::COLOR_BGR2GRAY);
    cv::equalizeHist(gray, gray);

    std::vector<cv::Rect> faces;
    faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, cv::Size(30, 30));

    for (const auto &face : faces) {
        cv::rectangle(img, face, cv::Scalar(255, 0, 0), 2);

        cv::Mat faceROI = gray(face);

        auto eyeCascade = cv::CascadeClassifier();
        eyeCascade.load(cv::samples::findFile("haarcascade_eye.xml"));

        std::vector<cv::Rect> eyes;
        eyeCascade.detectMultiScale(faceROI, eyes);

        for (const auto &eye : eyes) {
            cv::Point center(face.x + eye.x + eye.width / 2,
                            face.y + eye.y + eye.height / 2);
            int radius = cvRound((eye.width + eye.height) * 0.25);
            cv::circle(img, center, radius, cv::Scalar(0, 255, 0), 2);
        }
    }

    cv::imshow("Face Detection", img);
    cv::waitKey(0);
}
```

### 5.2 DNN 模块推理

```cpp
void dnnInference() {
    auto net = cv::dnn::readNetFromONNX("model.onnx");

    cv::Mat img = cv::imread("input.jpg");

    cv::Mat blob = cv::dnn::blobFromImage(img, 1.0 / 255.0,
                                           cv::Size(224, 224),
                                           cv::Scalar(0, 0, 0),
                                           true, false);
    net.setInput(blob);

    cv::Mat output = net.forward();

    cv::Point classIdPoint;
    double confidence;
    cv::minMaxLoc(output.reshape(1, 1), nullptr, &confidence, nullptr, &classIdPoint);
    int classId = classIdPoint.x;

    std::cout << "Class: " << classId << ", Confidence: " << confidence << std::endl;
}

// YOLO 目标检测
void yoloDetection() {
    auto net = cv::dnn::readNetFromDarknet("yolov4.cfg", "yolov4.weights");
    net.setPreferableBackend(cv::dnn::DNN_BACKEND_OPENCV);
    net.setPreferableTarget(cv::dnn::DNN_TARGET_CPU);

    cv::Mat img = cv::imread("input.jpg");

    cv::Mat blob = cv::dnn::blobFromImage(img, 1.0 / 255.0,
                                           cv::Size(416, 416),
                                           cv::Scalar(0, 0, 0),
                                           true, false);
    net.setInput(blob);

    std::vector<cv::Mat> outputs;
    net.forward(outputs, net.getUnconnectedOutLayersNames());

    float confThreshold = 0.5;
    float nmsThreshold = 0.4;

    std::vector<int> classIds;
    std::vector<float> confidences;
    std::vector<cv::Rect> boxes;

    for (const auto &output : outputs) {
        for (int i = 0; i < output.rows; i++) {
            float confidence = output.at<float>(i, 4);
            if (confidence > confThreshold) {
                int centerX = static_cast<int>(output.at<float>(i, 0) * img.cols);
                int centerY = static_cast<int>(output.at<float>(i, 1) * img.rows);
                int width = static_cast<int>(output.at<float>(i, 2) * img.cols);
                int height = static_cast<int>(output.at<float>(i, 3) * img.rows);

                int left = centerX - width / 2;
                int top = centerY - height / 2;

                cv::Mat scores = output.row(i).colRange(5, output.cols);
                cv::Point classIdPoint;
                double maxClassScore;
                cv::minMaxLoc(scores, nullptr, &maxClassScore, nullptr, &classIdPoint);

                classIds.push_back(classIdPoint.x);
                confidences.push_back(static_cast<float>(confidence * maxClassScore));
                boxes.push_back(cv::Rect(left, top, width, height));
            }
        }
    }

    std::vector<int> indices;
    cv::dnn::NMSBoxes(boxes, confidences, confThreshold, nmsThreshold, indices);

    for (int idx : indices) {
        cv::rectangle(img, boxes[idx], cv::Scalar(0, 255, 0), 2);
        std::string label = cv::format("%.2f", confidences[idx]);
        cv::putText(img, label, cv::Point(boxes[idx].x, boxes[idx].y - 5),
                    cv::FONT_HERSHEY_SIMPLEX, 0.5, cv::Scalar(0, 255, 0), 2);
    }
}
```

## 6. 视频处理

### 6.1 视频读写

```cpp
void videoProcessing() {
    cv::VideoCapture cap("input.mp4");
    if (!cap.isOpened()) {
        std::cerr << "无法打开视频" << std::endl;
        return;
    }

    int fps = static_cast<int>(cap.get(cv::CAP_PROP_FPS));
    int width = static_cast<int>(cap.get(cv::CAP_PROP_FRAME_WIDTH));
    int height = static_cast<int>(cap.get(cv::CAP_PROP_FRAME_HEIGHT));
    int totalFrames = static_cast<int>(cap.get(cv::CAP_PROP_FRAME_COUNT));

    cv::VideoWriter writer("output.mp4",
                           cv::VideoWriter::fourcc('m', 'p', '4', 'v'),
                           fps, cv::Size(width, height));

    cv::Mat frame;
    while (cap.read(frame)) {
        if (frame.empty()) break;

        cv::Mat gray;
        cv::cvtColor(frame, gray, cv::COLOR_BGR2GRAY);
        cv::cvtColor(gray, gray, cv::COLOR_GRAY2BGR);

        writer.write(gray);

        cv::imshow("Frame", frame);
        if (cv::waitKey(30) == 27) break;
    }

    cap.release();
    writer.release();
}
```

### 6.2 摄像头捕获

```cpp
void cameraCapture() {
    cv::VideoCapture cap(0);
    if (!cap.isOpened()) {
        std::cerr << "无法打开摄像头" << std::endl;
        return;
    }

    cap.set(cv::CAP_PROP_FRAME_WIDTH, 1280);
    cap.set(cv::CAP_PROP_FRAME_HEIGHT, 720);

    cv::Mat frame;
    while (true) {
        cap >> frame;
        if (frame.empty()) break;

        cv::imshow("Camera", frame);

        int key = cv::waitKey(30);
        if (key == 27) break;
        if (key == 's') {
            cv::imwrite("capture.jpg", frame);
        }
    }
}
```

### 6.3 光流法

```cpp
void opticalFlow() {
    cv::VideoCapture cap("input.mp4");

    cv::Mat prevGray, gray;
    std::vector<cv::Point2f> prevPoints, nextPoints;

    cv::Mat frame;
    cap >> frame;
    cv::cvtColor(frame, prevGray, cv::COLOR_BGR2GRAY);
    cv::goodFeaturesToTrack(prevGray, prevPoints, 200, 0.01, 10);

    while (cap.read(frame)) {
        cv::cvtColor(frame, gray, cv::COLOR_BGR2GRAY);

        std::vector<uchar> status;
        std::vector<float> err;
        cv::calcOpticalFlowPyrLK(prevGray, gray, prevPoints, nextPoints,
                                  status, err, cv::Size(21, 21), 3);

        for (size_t i = 0; i < nextPoints.size(); i++) {
            if (status[i]) {
                cv::arrowedLine(frame, prevPoints[i], nextPoints[i],
                               cv::Scalar(0, 255, 0), 2);
            }
        }

        cv::imshow("Optical Flow", frame);
        if (cv::waitKey(30) == 27) break;

        prevGray = gray.clone();
        prevPoints = nextPoints;
    }
}
```

## 7. 图像拼接与全景

```cpp
void imageStitching() {
    std::vector<cv::Mat> images;
    images.push_back(cv::imread("left.jpg"));
    images.push_back(cv::imread("right.jpg"));

    cv::Ptr<cv::Stitcher> stitcher = cv::Stitcher::create(cv::Stitcher::PANORAMA);

    cv::Mat panorama;
    cv::Stitcher::Status status = stitcher->stitch(images, panorama);

    if (status == cv::Stitcher::OK) {
        cv::imwrite("panorama.jpg", panorama);
    } else {
        std::cerr << "拼接失败，错误码: " << status << std::endl;
    }
}
```

## 8. 绘图函数

```cpp
void drawingFunctions() {
    cv::Mat canvas = cv::Mat::zeros(500, 800, CV_8UC3);

    cv::line(canvas, cv::Point(50, 50), cv::Point(200, 50),
             cv::Scalar(255, 0, 0), 2);

    cv::rectangle(canvas, cv::Point(50, 80), cv::Point(200, 180),
                  cv::Scalar(0, 255, 0), 2);

    cv::circle(canvas, cv::Point(300, 100), 50,
               cv::Scalar(0, 0, 255), -1);

    cv::ellipse(canvas, cv::Point(450, 100), cv::Size(80, 40),
                30, 0, 360, cv::Scalar(255, 255, 0), 2);

    std::vector<cv::Point> pts = {
        cv::Point(550, 50), cv::Point(600, 100),
        cv::Point(580, 150), cv::Point(520, 150), cv::Point(500, 100)
    };
    cv::fillPoly(canvas, std::vector<std::vector<cv::Point>>{pts},
                 cv::Scalar(255, 0, 255));

    cv::putText(canvas, "Hello OpenCV", cv::Point(50, 250),
                cv::FONT_HERSHEY_SIMPLEX, 1.0, cv::Scalar(255, 255, 255), 2);

    cv::arrowedLine(canvas, cv::Point(50, 300), cv::Point(200, 350),
                    cv::Scalar(0, 255, 255), 2);
}
```

## 9. 性能优化

### 9.1 基本优化技巧

```cpp
void optimization() {
    cv::Mat img = cv::imread("input.jpg");

    // 使用 ROI 避免复制
    cv::Mat roi = img(cv::Rect(100, 100, 200, 200));

    // 使用连续内存
    cv::Mat continuous;
    if (!img.isContinuous()) {
        img.clone().copyTo(continuous);
    }

    // 使用 OpenCV 内置函数代替手动循环
    // ❌ 慢
    cv::Mat manualResult = img.clone();
    for (int y = 0; y < img.rows; y++) {
        for (int x = 0; x < img.cols; x++) {
            manualResult.at<cv::Vec3b>(y, x) = 255 - img.at<cv::Vec3b>(y, x);
        }
    }

    // ✅ 快
    cv::Mat opencvResult;
    cv::bitwise_not(img, opencvResult);

    // 使用并行处理
    cv::setNumThreads(4);
}
```

### 9.2 性能测量

```cpp
void performanceMeasurement() {
    cv::Mat img = cv::imread("input.jpg");

    auto start = cv::getTickCount();

    cv::Mat blurred;
    cv::GaussianBlur(img, blurred, cv::Size(15, 15), 0);

    auto end = cv::getTickCount();
    double elapsed = (end - start) / cv::getTickFrequency();
    std::cout << "耗时: " << elapsed * 1000 << " ms" << std::endl;

    cv::TickMeter tm;
    tm.start();

    cv::Mat edges;
    cv::Canny(img, edges, 50, 150);

    tm.stop();
    std::cout << "Canny 耗时: " << tm.getTimeMilli() << " ms" << std::endl;
}
```

### 9.3 GPU 加速

```cpp
#ifdef HAVE_OPENCV_CUDA
void gpuAcceleration() {
    cv::cuda::GpuMat d_src, d_dst;

    cv::Mat src = cv::imread("input.jpg");
    d_src.upload(src);

    cv::Ptr<cv::cuda::Filter> gaussianFilter =
        cv::cuda::createGaussianFilter(d_src.type(), -1, cv::Size(15, 15), 0);
    gaussianFilter->apply(d_src, d_dst);

    cv::Mat result;
    d_dst.download(result);
}
#endif
```

## 10. 面试题

### 1. Mat 的引用计数机制？

- Mat 使用引用计数管理内存，多个 Mat 对象可共享同一数据
- `clone()` 和 `copyTo()` 创建深拷贝，独立内存
- 赋值和 ROI 操作创建浅拷贝，共享数据
- 当引用计数降为 0 时自动释放内存

### 2. BGR 和 RGB 的区别？

OpenCV 默认使用 BGR 通道顺序，而非 RGB。在与其他库交互时需要转换：
```cpp
cv::cvtColor(bgrImg, rgbImg, cv::COLOR_BGR2RGB);
```

### 3. 图像滤波的选择？

| 滤波器 | 适用场景 | 特点 |
|--------|----------|------|
| 均值滤波 | 简单去噪 | 速度快，模糊边缘 |
| 高斯滤波 | 通用去噪 | 保留边缘，最常用 |
| 中值滤波 | 椒盐噪声 | 去除脉冲噪声 |
| 双边滤波 | 保边去噪 | 保留边缘，速度慢 |

### 4. 特征检测算法对比？

| 算法 | 尺度不变 | 旋转不变 | 速度 | 专利 |
|------|----------|----------|------|------|
| Harris | ❌ | ❌ | 快 | 无 |
| SIFT | ✅ | ✅ | 慢 | 已过期 |
| SURF | ✅ | ✅ | 中 | 已过期 |
| ORB | ✅ | ✅ | 快 | 无 |

### 5. OpenCV 中如何处理大图像？

- 使用 ROI 分块处理
- 降低分辨率（`cv::pyrDown`）
- 使用 `UMat` 自动并行化
- 使用 CUDA 加速（`cv::cuda`）
- 流式处理，避免一次性加载全部数据
