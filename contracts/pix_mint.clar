;; PixMint - NFT Minting Platform with Royalties
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Define NFT
(define-non-fungible-token pix-nft uint)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-invalid-token (err u102))
(define-constant err-token-exists (err u103))
(define-constant err-exceeds-supply (err u104))
(define-constant err-payment-failed (err u105))
(define-constant err-invalid-royalty (err u106))

;; Data vars
(define-data-var last-token-id uint u0)
(define-data-var mint-price uint u10000000) ;; 10 STX
(define-data-var max-supply uint u1000)
(define-data-var default-royalty-percent uint u5) ;; 5% default royalty

;; Storage
(define-map token-metadata uint (string-ascii 256))
(define-map token-uris uint (string-ascii 256))
(define-map token-creators uint principal)
(define-map token-royalties uint uint)
(define-map creator-royalties principal uint)

;; Private functions
(define-private (is-token-owner (token-id uint) (user principal))
    (is-eq (unwrap! (nft-get-owner? pix-nft token-id) false) user)
)

(define-private (pay-royalties (token-id uint) (payment uint))
    (let (
        (creator (unwrap! (map-get? token-creators token-id) (ok true)))
        (royalty-percent (default-to (var-get default-royalty-percent) (map-get? token-royalties token-id)))
        (royalty-amount (/ (* payment royalty-percent) u100))
    )
    (if (> royalty-amount u0)
        (try! (stx-transfer? royalty-amount tx-sender creator))
        (ok true)
    )
)

;; Public functions
(define-public (set-mint-price (new-price uint))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (ok (var-set mint-price new-price))
    )
)

(define-public (set-default-royalty (royalty-percent uint))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (asserts! (<= royalty-percent u100) err-invalid-royalty)
        (ok (var-set default-royalty-percent royalty-percent))
    )
)

(define-public (mint (metadata-uri (string-ascii 256)))
    (let
        (
            (token-id (+ (var-get last-token-id) u1))
        )
        (asserts! (<= token-id (var-get max-supply)) err-exceeds-supply)
        (unwrap! (stx-transfer? (var-get mint-price) tx-sender contract-owner) err-payment-failed)
        (try! (nft-mint? pix-nft token-id tx-sender))
        (map-set token-uris token-id metadata-uri)
        (map-set token-creators token-id tx-sender)
        (var-set last-token-id token-id)
        (ok token-id)
    )
)

(define-public (batch-mint (metadata-uris (list 10 (string-ascii 256))))
    (let
        (
            (count (len metadata-uris))
            (start-id (+ (var-get last-token-id) u1))
        )
        (asserts! (<= (+ start-id count) (var-get max-supply)) err-exceeds-supply)
        (unwrap! (stx-transfer? (* (var-get mint-price) count) tx-sender contract-owner) err-payment-failed)
        (map mint-single metadata-uris)
        (ok start-id)
    )
)

(define-private (mint-single (metadata-uri (string-ascii 256)))
    (let
        (
            (token-id (+ (var-get last-token-id) u1))
        )
        (try! (nft-mint? pix-nft token-id tx-sender))
        (map-set token-uris token-id metadata-uri)
        (map-set token-creators token-id tx-sender)
        (var-set last-token-id token-id)
        (ok token-id)
    )
)

(define-public (set-token-royalty (token-id uint) (royalty-percent uint))
    (begin
        (asserts! (is-eq (some tx-sender) (map-get? token-creators token-id)) err-not-token-owner)
        (asserts! (<= royalty-percent u100) err-invalid-royalty)
        (ok (map-set token-royalties token-id royalty-percent))
    )
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-token-owner token-id sender) err-not-token-owner)
        (try! (pay-royalties token-id (var-get mint-price)))
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

(define-read-only (get-token-creator (token-id uint))
    (ok (map-get? token-creators token-id))
)

(define-read-only (get-token-royalty (token-id uint))
    (ok (default-to (var-get default-royalty-percent) (map-get? token-royalties token-id)))
)

(define-read-only (get-last-token-id)
    (ok (var-get last-token-id))
)

(define-read-only (get-mint-price)
    (ok (var-get mint-price))
)
