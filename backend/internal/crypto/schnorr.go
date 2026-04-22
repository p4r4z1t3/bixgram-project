package crypto

import (
	"encoding/hex"
	"fmt"

	"github.com/btcsuite/btcd/btcec/v2/schnorr"
)

// VerifySignature проверяет подпись Schnorr для события Nostr
func VerifySignature(pubkeyHex, sigHex, idHex string) (bool, error) {
	pubkeyBytes, err := hex.DecodeString(pubkeyHex)
	if err != nil {
		return false, fmt.Errorf("invalid pubkey hex: %w", err)
	}

	sigBytes, err := hex.DecodeString(sigHex)
	if err != nil {
		return false, fmt.Errorf("invalid signature hex: %w", err)
	}

	idBytes, err := hex.DecodeString(idHex)
	if err != nil {
		return false, fmt.Errorf("invalid id hex: %w", err)
	}

	pubKey, err := schnorr.ParsePubKey(pubkeyBytes)
	if err != nil {
		return false, fmt.Errorf("invalid pubkey for schnorr: %w", err)
	}

	sig, err := schnorr.ParseSignature(sigBytes)
	if err != nil {
		return false, fmt.Errorf("invalid signature for schnorr: %w", err)
	}

	return sig.Verify(idBytes, pubKey), nil
}
