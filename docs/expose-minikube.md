## Expose minikube to local network

```nginx 
# This binds your laptop's port 80 to the ingress controller inside minikube
kubectl port-forward --address 0.0.0.0 -n ingress-nginx svc/ingress-nginx-controller 80:80
