import { parseWalletDataFromStoredToken } from "./utils";

describe("Calimero Sdk utils",
  () =>{
    it("parses the public key to the expected format",
      () =>  {
        // eslint-disable-next-line max-len
        const tokenString = "{\"walletData\":{\"accountId\":\"dalepapi.testnet\",\"message\":\"31f17439504088dae0318a0d880f20edd626e07074a62ec23a3bf073dfd4e9f5\",\"blockId\":\"zgVgfWV6A9cmKX8nD2bBWiiHSJMmSj8XJAkViFrPJaB\",\"publicKey\":{\"keyType\":0,\"data\":{\"type\":\"Buffer\",\"data\":[113,194,32,182,137,245,117,102,47,29,7,208,159,61,115,6,22,77,186,205,78,15,206,41,198,255,237,119,137,169,15,94]}},\"signature\":{\"0\":250,\"1\":141,\"2\":56,\"3\":79,\"4\":90,\"5\":113,\"6\":134,\"7\":53,\"8\":162,\"9\":46,\"10\":244,\"11\":173,\"12\":8,\"13\":198,\"14\":169,\"15\":128,\"16\":116,\"17\":135,\"18\":42,\"19\":121,\"20\":208,\"21\":36,\"22\":109,\"23\":227,\"24\":106,\"25\":156,\"26\":99,\"27\":79,\"28\":159,\"29\":121,\"30\":189,\"31\":31,\"32\":67,\"33\":12,\"34\":72,\"35\":134,\"36\":42,\"37\":15,\"38\":91,\"39\":106,\"40\":171,\"41\":179,\"42\":89,\"43\":216,\"44\":172,\"45\":6,\"46\":52,\"47\":106,\"48\":223,\"49\":92,\"50\":153,\"51\":247,\"52\":86,\"53\":115,\"54\":155,\"55\":13,\"56\":150,\"57\":77,\"58\":227,\"59\":179,\"60\":108,\"61\":133,\"62\":4,\"63\":1}},\"tokenData\":{\"accountId\":\"dalepapi.testnet\",\"shardId\":\"xabisahrd-calimero-testnet\",\"from\":\"2022-09-08T10:42:51.558Z\",\"to\":\"2022-10-08T10:42:51.558Z\"}}";
        const { publicKey } = parseWalletDataFromStoredToken(tokenString);
        expect(publicKey.toString()).toMatch(/^ed25519/);
      });
  });
