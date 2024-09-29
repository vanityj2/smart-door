#ifndef _WIFI_H_
#define _WIFI_H_
#include "stm32f1xx_hal.h"

#define WIFI_User 				"vanity"
#define WIFI_Pass   			"20040222"
#define ESP8266_UserName 		"ESP8266DUAN&k0h2e9gLrJX"//设置连接阿里云的UserName
#define ESP8266_PassWord		"186bbabe5e1e7af893433dbd0bf24dae1050c79362980c4f0c626d9c9acab8c2"//设置连接阿里云的PassWord
#define ESP8266_ClientID		"k0h2e9gLrJX.ESP8266DUAN|securemode=2\\,signmethod=hmacsha256\\,timestamp=1716364639174|"//设置连接阿里云的ClientID，注意,需要添加转义字符，=> \\,
#define ESP8266_Domain_Name		"iot-06z00fzqb49msui.mqtt.iothub.aliyuncs.com"//设置连接阿里云的Domain_Name
#define ESP8266_Port 			1883												 //设置连接阿里云的端口号
#define ESP8266_Reconnect		1                    //设置是否自动重连   0：不自动重连   1：自动重连
#define ESP8266_Post_re			"/sys/k0h2e9gLrJX/ESP8266DUAN/thing/service/property/set"//订阅阿里云的Topic
#define ESP8266_Post			"/k0h2e9gLrJX/ESP8266DUAN/user/ESP8266DUAN"//订阅阿里云的Topic


#define  ESP8266_SET          "/sys/k0h2e9gLrJX/ESP8266DUAN/thing/service/property/set"


extern uint8_t temperature;
extern uint8_t Door_state;
void wifi_init(void);
void create_Json(uint8_t temperature,uint8_t Door_state);
void rcv_json(void);
#endif /* WIFI_WIFI_H_ */




