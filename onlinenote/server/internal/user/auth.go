package user

import (
	"crypto/rand"
	"encoding/binary"
	"encoding/hex"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID           string `json:"id"`
	Username     string `json:"username"`
	PasswordHash string `json:"-"`
	Email        string `json:"email,omitempty"`
	Avatar       string `json:"avatar,omitempty"`
	Color        string `json:"color"`
	CreatedAt    string `json:"createdAt"`
	LastActiveAt string `json:"lastActiveAt"`
}

type Claims struct {
	UserID   string `json:"userId"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

var colorPool = []string{
	"#FF5733", "#33FF57", "#3357FF", "#FF33F5",
	"#F5FF33", "#33FFF5", "#FF8833", "#8833FF",
	"#33FF88", "#FF3388", "#3388FF", "#88FF33",
}

func GenerateID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPassword(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func GenerateToken(userID, username, secret string) (string, error) {
	claims := &Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func ParseToken(tokenString, secret string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, jwt.ErrTokenInvalidClaims
}
func RandomColor() string {
	b := make([]byte, 8)
	rand.Read(b)
	idx := int(binary.BigEndian.Uint64(b) % uint64(len(colorPool)))
	return colorPool[idx]
}
