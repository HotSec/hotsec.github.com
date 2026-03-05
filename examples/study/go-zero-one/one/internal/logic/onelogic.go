// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"context"

	"one/internal/svc"
	"one/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type OneLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewOneLogic(ctx context.Context, svcCtx *svc.ServiceContext) *OneLogic {
	return &OneLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *OneLogic) One(req *types.Request) (resp *types.Response, err error) {
	// todo: add your logic here and delete this line
	resp = {
		
	}
	return 
}
