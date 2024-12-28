;; PixMint - Simple NFT Minting Platform
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Define NFT
(define-non-fungible-token pix-nft uint)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-invalid-token (err u102))
(define-constant err-token-exists (err u103))

;; Data vars
(define-data-var last-token-id uint u0)
(define-data-var mint-price uint u10000000) ;; 10 STX
(define-data-var max-supply uint u1000)

;; Storage
(define-map token-metadata uint (string-ascii 256))
(define-map token-uris uint (string-ascii 256))

;; Private functions
(define-private (is-token-owner (token-id uint) (user principal))
    (is-eq (unwrap! (nft-get-owner? pix-nft token-id) false) user)
)

;; Public functions
(define-public (set-mint-price (new-price uint))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (ok (var-set mint-price new-price))
    )
)

(define-public (mint (metadata-uri (string-ascii 256)))
    (let
        (
            (token-id (+ (var-get last-token-id) u1))
        )
        (asserts! (<= token-id (var-get max-supply)) (err u104))
        (unwrap! (stx-transfer? (var-get mint-price) tx-sender contract-owner) (err u105))
        (try! (nft-mint? pix-nft token-id tx-sender))
        (map-set token-uris token-id metadata-uri)
        (var-set last-token-id token-id)
        (ok token-id)
    )
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-token-owner token-id sender) err-not-token-owner)
        (nft-transfer? pix-nft token-id sender recipient)
    )
)

;; Read only functions
(define-read-only (get-token-uri (token-id uint))
    (ok (map-get? token-uris token-id))
)

(define-read-only (get-owner (token-id uint))
    (ok (nft-get-owner? pix-nft token-id))
)

(define-read-only (get-last-token-id)
    (ok (var-get last-token-id))
)

(define-read-only (get-mint-price)
    (ok (var-get mint-price))
)