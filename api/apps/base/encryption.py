import base64

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from project import settings


class Encryption:
    _salt = settings.ENCRYPTION_SALT

    @classmethod
    def _make_key_from_password(cls, password: str) -> bytes:
        password = bytes(password, "utf-8")
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=cls._salt,
            iterations=480000,
        )
        return base64.urlsafe_b64encode(kdf.derive(password))

    @classmethod
    def aes_encrypt(cls, data: str, password: str) -> str:
        data = bytes(data, "utf-8")

        key = cls._make_key_from_password(password)
        f = Fernet(key)

        return f.encrypt(data).decode("utf-8")

    @classmethod
    def aes_decrypt(cls, data: str, password: str) -> str:
        data = bytes(data, "utf-8")

        key = cls._make_key_from_password(password)
        f = Fernet(key)

        return f.decrypt(data).decode("utf-8")
