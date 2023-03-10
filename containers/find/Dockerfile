FROM node:18-alpine

RUN apk --no-cache add \
    bash \
    curl \
    iproute2 \
    libc6-compat

WORKDIR /find

RUN curl -Lo firecracker.tgz https://github.com/firecracker-microvm/firecracker/releases/download/v1.3.1/firecracker-v1.3.1-x86_64.tgz \
    && mkdir firecracker \
    && tar -xf firecracker.tgz -C firecracker \
    && chmod +x firecracker/firecracker-v1.3.1-x86_64 \
    && mv firecracker/firecracker-v1.3.1-x86_64 /usr/local/bin/firecracker

ENTRYPOINT ["/usr/local/bin/start-firecracker"]
