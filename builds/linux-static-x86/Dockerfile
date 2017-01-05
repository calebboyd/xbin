FROM i386/alpine:3.4

ARG NODE_VERSION
ARG NPM_VERSION
ARG XBIN_VERSION

RUN apk add --no-cache curl make gcc g++ binutils-gold python linux-headers paxctl libgcc libstdc++ git vim tar gzip wget

ENV NPM_VERSION=$NPM_VERSION
ENV NODE_VERSION=$NODE_VERSION
ENV XBIN_VERSION=$XBIN_VERSION

WORKDIR /

RUN curl -sSL https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}.tar.gz | tar -xz && \
  cd /node-v${NODE_VERSION} && \
  ./configure --prefix=/usr --fully-static && \
  make -j$(grep -c ^processor /proc/cpuinfo 2>/dev/null || 1) && \
  make install && \
  paxctl -cm /usr/bin/node

RUN mkdir xbintemp && mv node-v${NODE_VERSION} xbintemp/${NODE_VERSION}
RUN npm install -g xbin@${XBIN_VERSION}
ENV XBIN_TEMP=/xbintemp

RUN echo 'console.log("setup")' | xbin -c="--fully-static" > out.bin

RUN node -e "var f=require('fs'),s='*'.repeat(19),o='out.bin';c=f.readFileSync(o);f.writeFileSync(o,c.slice(0,c.indexOf('/'+s+'xbin-start')))"
#docker build --build-arg NODE_VERSION=6.9.3 --build-arg NPM_VERSION=3.10.10 --build-arg XBIN_VERSION=2.2.0 -t xbin-static:6.9.3 .
#docker run -it -d xbin-static:6.9.3 sh
#docker ps
#docker cp <container_id>:/out.bin linux-static-ia32-6.9.3
