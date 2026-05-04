# Pygame

Pygame 是 Python 最流行的 2D 游戏开发库，基于 SDL（Simple DirectMedia Layer）。

## 安装

```bash
pip install pygame
```

## 核心模块

| 模块 | 用途 |
|------|------|
| `pygame.display` | 窗口和屏幕管理 |
| `pygame.event` | 事件处理（键盘/鼠标/定时器） |
| `pygame.surface` | 图像表面操作 |
| `pygame.sprite` | 精灵和碰撞检测 |
| `pygame.mixer` | 音频播放 |
| `pygame.font` | 文字渲染 |
| `pygame.image` | 图片加载与保存 |
| `pygame.time` | 时钟与帧率控制 |

## 最小示例

```python
import pygame

pygame.init()
screen = pygame.display.set_mode((800, 600))
pygame.display.set_caption("Hello Pygame")

clock = pygame.time.Clock()
running = True

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    screen.fill((0, 0, 0))
    pygame.draw.circle(screen, (255, 0, 0), (400, 300), 50)
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
```

## 精灵与碰撞检测

```python
class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((50, 50))
        self.image.fill((0, 255, 0))
        self.rect = self.image.get_rect(center=(400, 300))

    def update(self, keys):
        if keys[pygame.K_LEFT]:
            self.rect.x -= 5
        if keys[pygame.K_RIGHT]:
            self.rect.x += 5

player = Player()
enemies = pygame.sprite.Group()

if pygame.sprite.spritecollide(player, enemies, False):
    print("Collision!")
```

## 音频

```python
pygame.mixer.init()
sound = pygame.mixer.Sound("explosion.wav")
sound.play()

pygame.mixer.music.load("bgm.mp3")
pygame.mixer.music.play(-1)  # 循环播放
```

## 适用场景

- 2D 游戏原型开发
- 游戏编程教学
- 简单的可视化应用
- 不适合大型 3D 游戏（考虑 Unity/Unreal）
