# The tag here should match the Meteor version of your app, per .meteor/release
FROM hub.eole.education/proxyhub/geoffreybooth/meteor-base:2.4

# Copy app package.json and package-lock.json into container
COPY ./app/package*.json $APP_SOURCE_FOLDER/

RUN bash $SCRIPTS_FOLDER/build-app-npm-dependencies.sh

# Copy app source into container
COPY ./app $APP_SOURCE_FOLDER/

RUN bash $SCRIPTS_FOLDER/build-meteor-bundle.sh
# run npm install after initial installation because resolutions
# are not taken in account with npm ci
RUN cd $APP_SOURCE_FOLDER && meteor npm install

# Rather than Node 8 latest (Alpine), you can also use the specific version of Node expected by your Meteor release, per https://docs.meteor.com/changelog.html
FROM hub.eole.education/proxyhub/library/node:14.17.6-alpine

ENV APP_BUNDLE_FOLDER /opt/bundle
ENV SCRIPTS_FOLDER /docker

# Install OS build dependencies, which we remove later after we’ve compiled native Node extensions
RUN apk --no-cache --virtual .node-gyp-compilation-dependencies add \
		g++ \
		make \
		python \
	# And runtime dependencies, which we keep
	&& apk --no-cache add \
		bash \
		ca-certificates

# Copy in entrypoint
COPY --from=0 $SCRIPTS_FOLDER $SCRIPTS_FOLDER/

# Copy in app bundle
COPY --from=0 $APP_BUNDLE_FOLDER/bundle $APP_BUNDLE_FOLDER/bundle/

RUN bash $SCRIPTS_FOLDER/build-meteor-npm-dependencies.sh --build-from-source \
	&& apk del .node-gyp-compilation-dependencies

# Start app
ENTRYPOINT ["/docker/entrypoint.sh"]

CMD ["node", "main.js"]
