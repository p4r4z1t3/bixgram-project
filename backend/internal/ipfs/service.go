package ipfs

import (
	"context"
	"io"

	shell "github.com/ipfs/go-ipfs-api"
)

type Service struct {
	sh *shell.Shell
}

func NewService(url string) *Service {
	return &Service{
		sh: shell.NewShell(url),
	}
}

// Upload загружает файл в IPFS и возвращает CID
func (s *Service) Upload(ctx context.Context, r io.Reader) (string, error) {
	cid, err := s.sh.Add(r)
	if err != nil {
		return "", err
	}
	return cid, nil
}

// Pin закрепляет файл в IPFS, чтобы его не удалил garbage collector
func (s *Service) Pin(ctx context.Context, cid string) error {
	return s.sh.Pin(cid)
}

// Cat получает файл из IPFS по CID
func (s *Service) Cat(ctx context.Context, cid string) (io.ReadCloser, error) {
	return s.sh.Cat(cid)
}
