## secret config for k8s deployment

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-secret

type: Opaque
stringData:
  JWT_SECRETE: "your secret"
```

## configmap example 

```yaml 
apiVersion: v1
kind: ConfigMap
metadata:
  name: todo-config 

data:
  MONGO_URI: "mongodb://mongodb:27017/todoapp"
  AUTH_SERVICE_URL: "http://todo-auth:5002"
  BACKEND_SERVICE_URL: "http://todo-backend:5001"
  LLM_SERVICE_URL: "http://todo-llm:5003"
  ALLOW_ORIGIN: "example.com"
  LLM_MODEL: "ollama model"
  OLLAMA_HOST: "http://host.minikube.internal:11434"
