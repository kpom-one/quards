package api

import (
	"fmt"
	"net/http"
	"os"

	"quards/internal/database"

	"github.com/gorilla/mux"
)

func Run() error {
	if err := database.InitDB(); err != nil {
		return fmt.Errorf("init db: %w", err)
	}
	defer database.CloseDB()

	r := mux.NewRouter()
	apiRouter := r.PathPrefix("/api").Subrouter()

	apiRouter.HandleFunc("/decks", ListDecksHandler).Methods("GET")
	apiRouter.HandleFunc("/decks", CreateDeckHandler).Methods("POST")
	apiRouter.HandleFunc("/decks/{id:[0-9]+}", GetDeckHandler).Methods("GET")
	apiRouter.HandleFunc("/decks/{id:[0-9]+}", UpdateDeckHandler).Methods("PUT")
	apiRouter.HandleFunc("/decks/{id:[0-9]+}", DeleteDeckHandler).Methods("DELETE")
	// Keep legacy name-based endpoints for backward compatibility during migration
	apiRouter.HandleFunc("/decks/name/{deckname}", GetDeckByNameHandler).Methods("GET")

	// Game management endpoints
	apiRouter.HandleFunc("/games", ListGamesHandler).Methods("GET")
	apiRouter.HandleFunc("/games", CreateGameHandler).Methods("POST")
	apiRouter.HandleFunc("/games/{id}", GetGameHandler).Methods("GET")
	apiRouter.HandleFunc("/games/{id}", DeleteGameHandler).Methods("DELETE")
	apiRouter.HandleFunc("/games/{id}/actions", GameAvailableActionsHandler).Methods("GET")
	apiRouter.HandleFunc("/games/{id}/execute", ExecuteActionHandler).Methods("POST")
	apiRouter.HandleFunc("/games/{id}/steps", GameStepsHandler).Methods("GET")
	apiRouter.HandleFunc("/games/{id}/history", GameHistoryHandler).Methods("GET")
	apiRouter.HandleFunc("/games/{id}/navigation", StepsNavigationHandler).Methods("GET")
	apiRouter.HandleFunc("/games/{id}/state", GameStateHandler).Methods("GET")
	apiRouter.HandleFunc("/games/{id}/battlefield", GameBattlefieldHandler).Methods("GET")
	apiRouter.HandleFunc("/cache/stats", CacheStatsHandler).Methods("GET")

	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" && r.URL.RawQuery == "" {
			http.Redirect(w, r, "/nav.html", http.StatusFound)
			return
		}
		if r.URL.Path == "/" && r.URL.RawQuery != "" {
			http.ServeFile(w, r, "./static/index.html")
			return
		}
		http.FileServer(http.Dir("./static/")).ServeHTTP(w, r)
	}).Methods("GET")
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./static/")))

	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	host := os.Getenv("HOST")
	if host == "" {
		host = "localhost"
	}
	
	fmt.Printf("Server starting on port %s\n", port)
	fmt.Printf("Game viewer UI: http://%s:%s/\n", host, port)
	fmt.Printf("API endpoints:\n  - http://%s:%s/api/...\n", host, port)

	return http.ListenAndServe(":"+port, r)
}
