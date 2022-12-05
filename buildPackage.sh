#delete lib folder and node_modules from react project 
rm -rf lib && cd examples/calimero-login && rm -rf node_modules && \
    #rebuild dependencies and our package build and reinstall node modules of react project and start server
    cd ../.. && yarn && pnpm run build && cd examples/calimero-login && yarn && yarn start
