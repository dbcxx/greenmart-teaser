-- GreenMart waitlist. MySQL 8+ (uses window functions for queue position).
-- Run once: mysql "$DATABASE_URL" < db/schema.sql   (or `npm run db:migrate`)

CREATE TABLE IF NOT EXISTS waitlist_signups (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group`        ENUM('farmer', 'seller', 'buyer') NOT NULL,
  name           VARCHAR(120) NOT NULL,
  phone          VARCHAR(20)  NULL,
  email          VARCHAR(254) NULL,
  state          VARCHAR(40)  NOT NULL,
  lga_or_city    VARCHAR(80)  NOT NULL,
  categories     JSON         NULL,
  scale          VARCHAR(40)  NOT NULL,
  business_name  VARCHAR(120) NULL,
  sells_online   ENUM('yes', 'no') NULL,
  referral_code  CHAR(8)      NOT NULL,
  referred_by    VARCHAR(16)  NULL,
  referral_count INT UNSIGNED NOT NULL DEFAULT 0,
  utm_source     VARCHAR(64)  NULL,
  utm_campaign   VARCHAR(64)  NULL,
  consent        BOOLEAN      NOT NULL,
  ip_hash        CHAR(64)     NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_referral_code (referral_code),
  -- One person can join several groups, but only once per group.
  -- NULLs don't collide, so optional phone/email are fine.
  UNIQUE KEY uq_group_phone (`group`, phone),
  UNIQUE KEY uq_group_email (`group`, email),
  KEY ix_ip_created (ip_hash, created_at),
  KEY ix_state (state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
