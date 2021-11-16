# The tag here should match the Meteor version of your app, per .meteor/release
FROM hub.eole.education/proxyhub/geoffreybooth/meteor-base:2.5

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
FROM hub.eole.education/proxyhub/library/node:14.18.1-alpine

ENV APP_BUNDLE_FOLDER /opt/bundle
ENV SCRIPTS_FOLDER /docker

# Install OS build dependencies, which stay with this intermediate image but don’t become part of the final published image
RUN apk --no-cache add \
	bash \
	g++ \
	make \
	python3

# Copy in entrypoint
COPY --from=0 $SCRIPTS_FOLDER $SCRIPTS_FOLDER/

# Copy in app bundle
COPY --from=0 $APP_BUNDLE_FOLDER/bundle $APP_BUNDLE_FOLDER/bundle/

RUN bash $SCRIPTS_FOLDER/build-meteor-npm-dependencies.sh --build-from-source


# Start another Docker stage, so that the final image doesn’t contain the layer with the build dependencies
# See previous FROM line; this must match
FROM hub.eole.education/proxyhub/library/node:14.18.1-alpine

ENV APP_BUNDLE_FOLDER /opt/bundle
ENV SCRIPTS_FOLDER /docker

# Install OS runtime dependencies
RUN apk --no-cache add \
	bash \
	ca-certificates

# Copy in entrypoint with the built and installed dependencies from the previous image
COPY --from=1 $SCRIPTS_FOLDER $SCRIPTS_FOLDER/

# Copy in app bundle with the built and installed dependencies from the previous image
COPY --from=1 $APP_BUNDLE_FOLDER/bundle $APP_BUNDLE_FOLDER/bundle/

# Start app
ENTRYPOINT ["/docker/entrypoint.sh"]

CMD ["node", "main.js"]