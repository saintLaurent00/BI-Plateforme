package main

import (
	"os"
)

// Config contient la configuration centralisée de la plateforme
type ConfigStruct struct {
	DatabaseURL   string
	RedisURL      string
	JWTSecret     string
	MailProvider  string
	MailFrom      string
	MailPort      int
}

var Config = ConfigStruct{
	DatabaseURL:  getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/bi-db?sslmode=disable"),
	RedisURL:     getEnv("REDIS_URL", "valkey://localhost:6379"),
	JWTSecret:    getEnv("JWT_SECRET", "s3cr37_JwT_ch4ng3_m0i_en_pr0d"),
	MailProvider: getEnv("MAIL_PROVIDER", "smtp"),
	MailFrom:     getEnv("MAIL_FROM", "noreply@bi-plateforme.local"),
	MailPort:     1025, // MailDev sur localhost
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func main() {
	// Point d'entrée vide : config est chargée au startup
}
