import json

import jwt
import requests

from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed

from project.settings import AUTH0_DOMAIN, AUTH0_IDENTIFIER, JWT_ALGORITHM


def jwt_get_username_from_payload_handler(payload):
    username = payload.get("sub").replace("|", ".")
    authenticate(remote_user=username)
    return username


def jwt_decode_token(token):
    header = jwt.get_unverified_header(token)
    jwks = requests.get(f"{AUTH0_DOMAIN}.well-known/jwks.json").json()
    public_key = None
    for jwk in jwks["keys"]:
        jwk_kid = jwk.get("kid")
        header_kid = header.get("kid")

        if not jwk_kid or not header_kid:
            continue

        if jwk_kid == header_kid:
            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))

    if public_key is None:
        raise AuthenticationFailed(detail="Public key not found.")

    return jwt.decode(token, public_key, audience=AUTH0_IDENTIFIER, issuer=AUTH0_DOMAIN, algorithms=[JWT_ALGORITHM])
