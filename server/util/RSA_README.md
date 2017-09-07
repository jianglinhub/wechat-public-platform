# The step of generator RSA private and public key
```
首先需要进入openssl的交互界面，在命令行了输入openssl即可；
1)生成RSA私钥:
    genrsa -out rsa_private_key.pem 1024
2)把RSA私钥转换成PKCS8格式(密码：tima123):
    输入命令pkcs8 -topk8 -inform PEM -in rsa_private_key.pem -outform PEM –nocrypt，并回车。
3)生成RSA公钥:
    输入命令rsa -in rsa_private_key.pem -pubout -out rsa_public_key.pem，并回车。
```