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

# Use the specific version of Node expected by your Meteor release, per https://docs.meteor.com/changelog.html; this is expected for Meteor 2.5
FROM hub.eole.education/proxyhub/library/node:14.18.1-alpine

ENV APP_BUNDLE_FOLDER /opt/bundle
ENV SCRIPTS_FOLDER /docker

# Runtime dependencies; if your dependencies need compilation (native modules such as bcrypt) or you are using Meteor <1.8.1, use app-with-native-dependencies.dockerfile instead
RUN apk --no-cache add \
		bash \
		ca-certificates

# Copy in entrypoint
COPY --from=0 $SCRIPTS_FOLDER $SCRIPTS_FOLDER/

# Copy in app bundle
COPY --from=0 $APP_BUNDLE_FOLDER/bundle $APP_BUNDLE_FOLDER/bundle/

RUN sh $SCRIPTS_FOLDER/build-meteor-npm-dependencies.sh

# Start app
ENTRYPOINT ["/docker/entrypoint.sh"]

CMD ["node", "main.js"]