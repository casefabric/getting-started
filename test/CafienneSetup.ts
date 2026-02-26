import Config from "@cafienne/typescript-client/config";
import MockServer from "@cafienne/typescript-client/mock/mockserver";

export function setup() {
    Config.Log.level = 'debug';
    Config.TestCase.log = true;
    Config.CafienneService.url = 'http://test_engine_service:2027/';
    Config.TokenService.url = 'http://test_token_service:2077/token';
    Config.TokenService.issuer='http://localhost:33077'
    Config.RepositoryService.repository_folder = './CaseFiles/Compiled';
    Config.TestCase.polltimeout = 10_000;
}
export function CreateMockServer(): MockServer { return new MockServer(12378) };
