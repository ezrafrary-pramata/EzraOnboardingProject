# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"

pin "react", to: "https://ga.jspm.io/npm:react@18.2.0/index.js"
pin "react-dom", to: "https://ga.jspm.io/npm:react-dom@18.2.0/index.js"
pin "react-dom/client", to: "https://ga.jspm.io/npm:react-dom@18.2.0/client.js"
pin "scheduler", to: "https://ga.jspm.io/npm:scheduler@0.23.0/index.js"

# react components
pin "components/TaskList", to: "components/TaskList.js"
pin "components/NewTask", to: "components/NewTask.js"
pin "components/TaskShow", to: "components/TaskShow.js"