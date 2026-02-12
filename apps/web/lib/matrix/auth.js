"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeserverUnavailableError = exports.InvalidCredentialsError = exports.MatrixAuthError = void 0;
exports.loginWithPassword = loginWithPassword;
exports.validateSession = validateSession;
var matrix_js_sdk_1 = require("matrix-js-sdk");
// Matrix authentication error types
var MatrixAuthError = /** @class */ (function (_super) {
    __extends(MatrixAuthError, _super);
    function MatrixAuthError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'MatrixAuthError';
        return _this;
    }
    return MatrixAuthError;
}(Error));
exports.MatrixAuthError = MatrixAuthError;
var InvalidCredentialsError = /** @class */ (function (_super) {
    __extends(InvalidCredentialsError, _super);
    function InvalidCredentialsError() {
        return _super.call(this, 'Invalid username or password') || this;
    }
    return InvalidCredentialsError;
}(MatrixAuthError));
exports.InvalidCredentialsError = InvalidCredentialsError;
var HomeserverUnavailableError = /** @class */ (function (_super) {
    __extends(HomeserverUnavailableError, _super);
    function HomeserverUnavailableError(serverUrl) {
        return _super.call(this, "Matrix homeserver at ".concat(serverUrl, " is unavailable")) || this;
    }
    return HomeserverUnavailableError;
}(MatrixAuthError));
exports.HomeserverUnavailableError = HomeserverUnavailableError;
/**
 * Authenticate with Matrix homeserver using username and password
 * @param homeserverUrl Matrix homeserver URL
 * @param username User's Matrix username (e.g., @username:matrix.org)
 * @param password User's password
 * @returns Promise resolving to MatrixSession on successful login
 * @throws {InvalidCredentialsError} If login fails due to incorrect credentials
 * @throws {HomeserverUnavailableError} If homeserver cannot be reached
 */
function loginWithPassword(homeserverUrl, username, password) {
    return __awaiter(this, void 0, void 0, function () {
        var client, loginResponse, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    client = (0, matrix_js_sdk_1.createClient)({ baseUrl: homeserverUrl });
                    return [4 /*yield*/, client.login('m.login.password', {
                            user: username,
                            password: password,
                            type: 'm.login.password'
                        })];
                case 1:
                    loginResponse = _a.sent();
                    // Validate login response
                    if (!loginResponse.access_token) {
                        throw new InvalidCredentialsError();
                    }
                    // Return session details
                    return [2 /*return*/, {
                            accessToken: loginResponse.access_token,
                            userId: loginResponse.user_id,
                            deviceId: loginResponse.device_id,
                            homeserverUrl: homeserverUrl
                        }];
                case 2:
                    error_1 = _a.sent();
                    // Distinguish between different error types
                    if (error_1.errcode === 'M_FORBIDDEN') {
                        throw new InvalidCredentialsError();
                    }
                    if (error_1.name === 'TypeError' || error_1.code === 'ENOTFOUND') {
                        throw new HomeserverUnavailableError(homeserverUrl);
                    }
                    // Rethrow any other unexpected errors
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Validate an existing Matrix session
 * @param homeserverUrl Matrix homeserver URL
 * @param accessToken Session access token to validate
 * @returns Promise resolving to MatrixUser if session is valid
 * @throws {MatrixAuthError} If session is invalid or cannot be validated
 */
function validateSession(homeserverUrl, accessToken) {
    return __awaiter(this, void 0, void 0, function () {
        var client, userProfile, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    client = (0, matrix_js_sdk_1.createClient)({
                        baseUrl: homeserverUrl,
                        accessToken: accessToken
                    });
                    return [4 /*yield*/, client.getProfileInfo(client.credentials.userId)];
                case 1:
                    userProfile = _a.sent();
                    // Return user details
                    return [2 /*return*/, {
                            userId: client.credentials.userId,
                            displayName: userProfile.displayname,
                            avatarUrl: userProfile.avatar_url
                        }];
                case 2:
                    error_2 = _a.sent();
                    // Handle various authentication errors
                    if (error_2.errcode === 'M_UNKNOWN_TOKEN') {
                        throw new MatrixAuthError('Session token is invalid or expired');
                    }
                    if (error_2.name === 'TypeError' || error_2.code === 'ENOTFOUND') {
                        throw new HomeserverUnavailableError(homeserverUrl);
                    }
                    // Rethrow any other unexpected errors
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
