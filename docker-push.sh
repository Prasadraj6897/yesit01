#!/bin/sh

if [ -z "$TRAVIS_PULL_REQUEST" ] || [ "$TRAVIS_PULL_REQUEST" == "false" ]
then

	if [[ "$TRAVIS_BRANCH" == "staging" ]]; then
		export DOCKER_ENV=stage
		# new
		export REACT_APP_USERS_SERVICE_URL="http://yesit02-staging-alb-1453385111.us-west-1.elb.amazonaws.com"
	elif [[ "$TRAVIS_BRANCH" == "production" ]]; then
		export DOCKER_ENV=prod
		# new
		export REACT_APP_USERS_SERVICE_URL="http://yesit02-production-alb-1562189709.us-west-1.elb.amazonaws.com"
		export DATABASE_URL="$AWS_RDS_URI"
		export SECRET_KEY="$PRODUCTION_SECRET_KEY"
	fi

	if [ "$TRAVIS_BRANCH" == "staging" ] || \
		[ "$TRAVIS_BRANCH" == "production" ]
	then
		curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"

		unzip awscli-bundle.zip
		./awscli-bundle/install -b ~/bin/aws
		export PATH=~/bin:$PATH
		# add AWS_ACCOUNT_ID, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY env vars
		eval $(aws ecr get-login --region us-west-1 --no-include-email)
		export TAG=$TRAVIS_BRANCH
		export REPO=$AWS_ACCOUNT_ID.dkr.ecr.us-west-1.amazonaws.com
	fi

	if [ "$TRAVIS_BRANCH" == "staging" ] || \
		[ "$TRAVIS_BRANCH" == "production" ]
	then
		# users
		docker build $USERS_REPO -t $USERS:$COMMIT -f Dockerfile-prod
		docker tag $USERS:$COMMIT $REPO/$USERS:$TAG
		docker push $REPO/$USERS:$TAG
		# users db
		docker build $USERS_DB_REPO -t $USERS_DB:$COMMIT -f Dockerfile
		docker tag $USERS_DB:$COMMIT $REPO/$USERS_DB:$TAG
		docker push $REPO/$USERS_DB:$TAG
		# client
		docker build $CLIENT_REPO -t $CLIENT:$COMMIT -f Dockerfile-prod --build-arg REACT_APP_USERS_SERVICE_URL=$REACT_APP_USERS_SERVICE_URL
		docker tag $CLIENT:$COMMIT $REPO/$CLIENT:$TAG
		docker push $REPO/$CLIENT:$TAG
		# swagger
		docker build $SWAGGER_REPO -t $SWAGGER:$COMMIT -f Dockerfile-prod
		docker tag $SWAGGER:$COMMIT $REPO/$SWAGGER:$TAG
		docker push $REPO/$SWAGGER:$TAG
	fi
fi
