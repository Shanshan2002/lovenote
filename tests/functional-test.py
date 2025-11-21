#!/usr/bin/env python3
"""
LOVENOTE 功能测试套件
测试API端点和数据操作
"""

import json
import requests
import sys
from datetime import datetime

# 配置
BASE_URL = "http://localhost:8080/api"
TEST_RESULTS = {"total": 0, "passed": 0, "failed": 0}

def print_header(text):
    print(f"\n{'='*50}")
    print(f"  {text}")
    print(f"{'='*50}\n")

def test_case(name):
    """装饰器：测试用例"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            TEST_RESULTS["total"] += 1
            print(f"[{TEST_RESULTS['total']}] {name} ... ", end="")
            try:
                func(*args, **kwargs)
                TEST_RESULTS["passed"] += 1
                print("✓ PASS")
                return True
            except AssertionError as e:
                TEST_RESULTS["failed"] += 1
                print(f"✗ FAIL")
                print(f"    原因: {e}")
                return False
            except Exception as e:
                TEST_RESULTS["failed"] += 1
                print(f"✗ ERROR")
                print(f"    错误: {e}")
                return False
        return wrapper
    return decorator

# ============ 测试用例 ============

@test_case("测试服务器是否运行")
def test_server_running():
    try:
        response = requests.get(f"{BASE_URL}/users", timeout=5)
        assert response.status_code in [200, 404], "服务器无响应"
    except requests.exceptions.ConnectionError:
        raise AssertionError("无法连接到服务器，请确保服务器正在运行")

@test_case("测试获取用户列表")
def test_get_users():
    response = requests.get(f"{BASE_URL}/users")
    assert response.status_code == 200, f"状态码错误: {response.status_code}"
    users = response.json()
    assert isinstance(users, list), "返回数据应为数组"

@test_case("测试用户注册（重复用户）")
def test_register_duplicate():
    # 先获取现有用户
    response = requests.get(f"{BASE_URL}/users")
    users = response.json()
    
    if len(users) > 0:
        # 尝试注册已存在的用户
        existing_user = users[0]['username']
        response = requests.post(f"{BASE_URL}/users/register", json={
            "username": existing_user,
            "password": "test1234"
        })
        assert response.status_code == 400, "应该拒绝重复用户名"
    else:
        print("\n    (跳过: 没有现有用户)")

@test_case("测试用户登录（错误密码）")
def test_login_wrong_password():
    response = requests.get(f"{BASE_URL}/users")
    users = response.json()
    
    if len(users) > 0:
        username = users[0]['username']
        response = requests.post(f"{BASE_URL}/users/login", json={
            "username": username,
            "password": "wrongpassword"
        })
        assert response.status_code == 401, "应该拒绝错误密码"
    else:
        print("\n    (跳过: 没有用户)")

@test_case("测试用户登录（正确密码）")
def test_login_correct():
    response = requests.get(f"{BASE_URL}/users")
    users = response.json()
    
    if len(users) > 0:
        # 假设我们知道密码（从数据文件读取）
        with open('data/users.json', 'r') as f:
            user_data = json.load(f)
        
        if len(user_data) > 0:
            username = user_data[0]['username']
            password = user_data[0]['password']
            
            response = requests.post(f"{BASE_URL}/users/login", json={
                "username": username,
                "password": password
            })
            assert response.status_code == 200, f"登录失败: {response.text}"
            data = response.json()
            assert 'user' in data, "返回数据缺少user字段"
        else:
            print("\n    (跳过: 数据文件为空)")
    else:
        print("\n    (跳过: 没有用户)")

@test_case("测试获取接收消息")
def test_get_received_notes():
    response = requests.get(f"{BASE_URL}/users")
    users = response.json()
    
    if len(users) > 0:
        user_id = users[0]['id']
        response = requests.get(f"{BASE_URL}/notes/received/{user_id}")
        assert response.status_code == 200, f"获取消息失败: {response.status_code}"
        notes = response.json()
        assert isinstance(notes, list), "返回数据应为数组"
    else:
        print("\n    (跳过: 没有用户)")

@test_case("测试发送消息（缺少字段）")
def test_send_note_missing_fields():
    response = requests.post(f"{BASE_URL}/notes/send", json={
        "fromUserId": "test-id"
        # 缺少其他必填字段
    })
    assert response.status_code == 400, "应该拒绝不完整的请求"

@test_case("测试消息长度限制")
def test_message_length_limit():
    response = requests.get(f"{BASE_URL}/users")
    users = response.json()
    
    if len(users) >= 2:
        # 创建超长消息
        long_message = "a" * 10000
        response = requests.post(f"{BASE_URL}/notes/send", json={
            "fromUserId": users[0]['id'],
            "toUserId": users[1]['id'],
            "content": long_message,
            "title": "Test"
        })
        # 应该被拒绝或截断
        assert response.status_code in [400, 413], "应该限制消息长度"
    else:
        print("\n    (跳过: 用户不足2个)")

@test_case("测试获取未读消息数")
def test_unread_count():
    response = requests.get(f"{BASE_URL}/users")
    users = response.json()
    
    if len(users) > 0:
        user_id = users[0]['id']
        response = requests.get(f"{BASE_URL}/notes/unread/{user_id}")
        assert response.status_code == 200, f"获取未读数失败: {response.status_code}"
        data = response.json()
        assert 'unreadCount' in data, "返回数据缺少unreadCount字段"
        assert isinstance(data['unreadCount'], int), "未读数应为整数"
    else:
        print("\n    (跳过: 没有用户)")

@test_case("测试管理员删除用户（非管理员）")
def test_delete_user_non_admin():
    response = requests.get(f"{BASE_URL}/users")
    users = response.json()
    
    if len(users) >= 2:
        # 找一个非管理员用户
        non_admin = None
        target = None
        
        with open('data/users.json', 'r') as f:
            user_data = json.load(f)
        
        for user in user_data:
            if not user.get('isAdmin'):
                if non_admin is None:
                    non_admin = user['id']
                elif target is None:
                    target = user['id']
                    break
        
        if non_admin and target:
            response = requests.delete(
                f"{BASE_URL}/users/{target}?adminId={non_admin}"
            )
            assert response.status_code == 403, "非管理员不应该能删除用户"
        else:
            print("\n    (跳过: 没有足够的非管理员用户)")
    else:
        print("\n    (跳过: 用户不足)")

# ============ 主程序 ============

def main():
    print_header("LOVENOTE v1.2 功能测试")
    
    print("📋 测试 API 端点...")
    print(f"   服务器: {BASE_URL}")
    print()
    
    # 运行所有测试
    test_server_running()
    test_get_users()
    test_register_duplicate()
    test_login_wrong_password()
    test_login_correct()
    test_get_received_notes()
    test_send_note_missing_fields()
    test_message_length_limit()
    test_unread_count()
    test_delete_user_non_admin()
    
    # 打印结果
    print_header("测试结果总结")
    print(f"总测试数: {TEST_RESULTS['total']}")
    print(f"✓ 通过: {TEST_RESULTS['passed']}")
    print(f"✗ 失败: {TEST_RESULTS['failed']}")
    print()
    
    if TEST_RESULTS['failed'] == 0:
        print("✅ 所有测试通过！")
        sys.exit(0)
    else:
        print(f"❌ 有 {TEST_RESULTS['failed']} 个测试失败")
        sys.exit(1)

if __name__ == "__main__":
    main()
