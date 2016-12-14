FROM i386/alpine:3.4

ARG NODE_VERSION
ARG NPM_VERSION
ARG XBIN_VERSION

RUN apk add --no-cache curl make gcc g++ binutils-gold python linux-headers paxctl libgcc libstdc++ git vim tar gzip wget

ENV VERSION=v$NODE_VERSION
ENV NPM_VERSION=$NPM_VERSION
ENV NODE_VERSION=$NODE_VERSION
ENV XBIN_VERSION=$XBIN_VERSION

ENV CONFIG_FLAGS="--fully-static"

WORKDIR /

RUN curl -sSL https://nodejs.org/dist/${VERSION}/node-${VERSION}.tar.gz | tar -xz && \
  cd /node-${VERSION} && \
  ./configure --prefix=/usr ${CONFIG_FLAGS} && \
  make -j$(grep -c ^processor /proc/cpuinfo 2>/dev/null || 1) && \
  make install && \
  paxctl -cm /usr/bin/node && \
  cd / && \
  if [ -x /usr/bin/npm ]; then \
    npm install -g npm@${NPM_VERSION} && \
    find /usr/lib/node_modules/npm -name test -o -name .bin -type d | xargs rm -rf; \
  fi

RUN node -v
RUN npm -v

RUN mkdir xbintemp && mv node-${VERSION} xbintemp/${NODE_VERSION}
RUN npm install -g xbin@${XBIN_VERSION}
ENV XBIN_TEMP=/xbintemp

RUN echo 'console.log("setup")' | xbin -c="--fully-static" > out.bin

RUN node -e "var f=require('fs'),s='*'.repeat(19),o='out.bin';c=f.readFileSync(o);f.writeFileSync(o,c.slice(0,c.indexOf('/'+s+'xbin-start')))"
#docker build --build-arg NODE_VERSION=6.9.2 --build-arg NPM_VERSION=3.10.9 --build-arg XBIN_VERSION=2.1.1
