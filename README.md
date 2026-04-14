# InvenQR

![InvenQR Logo](./frontend/public/logo.png)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-5-FF4154?logo=reactquery&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)

오프라인 창고 자산을 온라인 데이터 자산으로 전환해 관리할 수 있도록 만든 재고관리 웹서비스입니다.  
상품 등록 요청, 관리자 승인/거절, 입출고 이력 관리, QR 기반 조회, CSV 다운로드까지 한 흐름으로 연결해 실제 운영 흐름에 가까운 재고관리 경험을 제공하는 것을 목표로 했습니다.

## 배포 링크

- Backend API: [https://invenqr.onrender.com](https://invenqr.onrender.com)
- Frontend: 배포 주소 추가 예정

## 빠른 목차

- [프로젝트 개요](#프로젝트-개요)
- [핵심 기능](#핵심-기능)
- [주요 워크플로우](#주요-워크플로우)
- [기술 스택](#기술-스택)
- [아키텍처](#아키텍처)
- [페이지 구성](#페이지-구성)
- [스크린샷](#스크린샷)
- [ERD](#erd)
- [실행 방법](#실행-방법)
- [시드 데이터](#시드-데이터)
- [API 요약](#api-요약)
- [트러블슈팅](#트러블슈팅)
- [향후 개선](#향후-개선)

## 프로젝트 개요

InvenQR는 창고 안의 자산을 `상품`, `창고`, `위치`, `입출고 기록`, `승인 요청` 단위로 관리하는 서비스입니다.

- 일반 사용자는 상품 조회, 상품 등록 요청, 입출고 기록 조회, QR 스캔, CSV 다운로드 기능을 사용할 수 있습니다.
- 관리자는 상품 승인/거절, 창고 관리, 전체 상품 관리, 관리자 전용 입출고 기록 조회 기능을 사용할 수 있습니다.
- 상품 상세 페이지에서는 QR 코드가 생성되며, QR 스캔 시 해당 상품 상세 페이지로 이동합니다.
- 다운로드 이력과 입출고 이력을 별도 로그로 남겨 추적할 수 있습니다.

## 왜 만들었는가

오프라인 재고 관리는 아직도 수기나 엑셀 중심으로 운영되는 경우가 많습니다.  
이 프로젝트는 아래 문제를 해결하는 데 초점을 맞췄습니다.

- 상품 등록 요청과 실제 등록 승인 과정을 분리해 데이터 신뢰성 확보
- 창고와 위치를 기준으로 상품을 명확하게 관리
- 입고/출고 이력과 현재 재고 수량이 어긋나지 않도록 로그 기반 관리
- QR 코드를 통해 현장에서 빠르게 상품 조회
- CSV 다운로드 기능으로 보고/정산/관리 업무 지원

## 핵심 기능

### 사용자 기능

- 회원가입 / 로그인
- 대시보드 통계 조회
- 전체 상품 목록 조회 및 필터링
- 상품 상세 조회
- QR 코드 생성 및 스캔 기반 상품 상세 이동
- 입출고 기록 조회
- CSV 다운로드
- 상품 등록 요청
- 요청 내역 조회
- 승인된 요청은 실제 상품 상세 페이지로 이동
- 거절된 요청은 거절 사유 확인 가능

### 관리자 기능

- 상품 등록 요청 승인 / 거절
- 창고 정보 추가 / 수정 / 삭제
- 전체 상품 직접 등록 / 수정 / 삭제
- 관리자 전용 입출고 기록 조회
- CSV 다운로드 기록 조회

## 주요 워크플로우

```mermaid
flowchart TD
    A["사용자 회원가입 / 로그인"] --> B["상품 목록 조회"]
    B --> C["상품 등록 요청"]
    C --> D["관리자 승인 대기"]
    D --> E["관리자 승인"]
    D --> F["관리자 거절"]
    E --> G["Product 테이블 저장"]
    F --> H["거절 사유 저장"]
    G --> I["상품 상세 페이지 조회"]
    I --> J["입고 / 출고 처리"]
    J --> K["InventoryLog 기록 저장"]
    I --> L["QR 코드 생성"]
    L --> M["QR 스캔 페이지"]
    M --> I
```

## 기술 스택

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- React Query
- Redux Toolkit
- React Hook Form
- Tailwind CSS
- Recharts
- html5-qrcode
- qrcode
- Axios
- React Toastify

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- MySQL
- JWT
- bcryptjs
- json2csv

## 아키텍처

```text
Frontend (React + TypeScript)
  ├─ React Query: 서버 상태 관리
  ├─ Redux Toolkit: 사용자 인증 상태 관리
  ├─ React Router: 페이지 라우팅
  └─ Axios: 백엔드 API 통신

Backend (Express + TypeScript)
  ├─ Controller: 요청/응답 처리
  ├─ Service: 비즈니스 로직 처리
  ├─ Prisma: DB 접근
  └─ JWT Middleware: 인증/권한 처리

Database (MySQL)
  ├─ User
  ├─ Product
  ├─ ProductRequest
  ├─ InventoryLog
  ├─ Warehouse
  ├─ Location
  ├─ Category
  └─ DownloadLog
```

## 페이지 구성

### 사용자 페이지

- `/login` : 로그인
- `/register` : 회원가입
- `/` : 대시보드
- `/product` : 전체 상품 조회
- `/product/:productId` : 상품 상세
- `/inventory` : 입출고 기록
- `/scan` : QR 스캔
- `/csv` : CSV 다운로드
- `/requestproduct` : 상품 등록 요청 / 요청 내역

### 관리자 페이지

- `/admin` : 관리자 메인
- `/admin/product` : 전체 상품 관리
- `/admin/inventorylog` : 관리자 입출고 기록 조회
- `/admin/requestproduct` : 상품 등록 승인 / 거절 관리

## 스크린샷

### QR Scan

![QR Scan](./frontend/public/InvenQR%20Scan.png)

### Mobile QR Scan

![QR Scan Mobile](./frontend/public/InvenQR%20Scan-m.png)

> 다른 페이지 스크린샷은 추후 `docs/images` 폴더로 분리해 추가하면 README 완성도를 더 높일 수 있습니다.

## 폴더 구조

```bash
InvenQR/
├─ frontend/
│  ├─ public/
│  └─ src/
│     ├─ api/
│     ├─ components/
│     ├─ hooks/
│     ├─ layouts/
│     ├─ pages/
│     │  └─ admin/
│     ├─ routes/
│     ├─ store/
│     └─ types/
└─ backend/
   ├─ prisma/
   └─ src/
      ├─ config/
      ├─ controllers/
      ├─ middleware/
      ├─ routes/
      ├─ services/
      └─ types/
```

## 데이터 모델

주요 엔티티는 아래와 같습니다.

- `User`
- `Product`
- `ProductRequest`
- `InventoryLog`
- `Warehouse`
- `Location`
- `Category`
- `DownloadLog`

핵심 관계:

- 하나의 `Warehouse`는 여러 `Location`을 가질 수 있습니다.
- 하나의 `Product`는 하나의 `Warehouse` / `Location`과 연결됩니다.
- `InventoryLog`는 특정 `Product`, `User`, `Location`을 기준으로 기록됩니다.
- `ProductRequest`는 사용자 요청과 관리자 승인/거절 이력을 분리해 관리합니다.

## ERD

```mermaid
erDiagram
    User ||--o{ Product : creates
    User ||--o{ ProductRequest : requests
    User ||--o{ ProductRequest : approves
    User ||--o{ InventoryLog : handles
    User ||--o{ DownloadLog : downloads

    Category ||--o{ Product : classifies
    Category ||--o{ ProductRequest : classifies

    Warehouse ||--o{ Location : contains
    Warehouse ||--o{ Product : stores
    Warehouse ||--o{ ProductRequest : requested_to
    Warehouse ||--o{ InventoryLog : tracks

    Location ||--o{ Product : assigned_to
    Location ||--o{ InventoryLog : logged_at

    Product ||--o{ InventoryLog : has

    User {
        int id PK
        string email
        string name
        string password
        enum role
    }

    Category {
        int id PK
        string name
    }

    Warehouse {
        int id PK
        string name
        string code
    }

    Location {
        int id PK
        string code
        int warehouseId FK
    }

    Product {
        int id PK
        string productCode
        string name
        int quantity
        int categoryId FK
        int warehouseId FK
        int locationId FK
        string qrCode
        int createdById FK
    }

    ProductRequest {
        int id PK
        string productCode
        string name
        int quantity
        int categoryId FK
        int warehouseId FK
        string locationCode
        int requestedById FK
        int approvedById FK
        enum status
    }

    InventoryLog {
        int id PK
        int productId FK
        int userId FK
        int warehouseId FK
        int locationId FK
        enum type
        int quantity
        datetime processedAt
    }

    DownloadLog {
        int id PK
        enum type
        string fileName
        int fileSize
        int userId FK
        datetime createdAt
    }
```

이 ERD는 실제 Prisma 스키마를 기준으로 핵심 관계만 요약한 구조입니다.  
특히 InvenQR는 `Warehouse -> Location -> Product -> InventoryLog` 흐름을 중심으로 재고와 이력을 연결합니다.

## API 요약

- `/user` : 회원가입, 로그인, 인증 확인
- `/dashboard` : 대시보드 통계
- `/product` : 상품 목록 / 상세 / QR 조회 / 생성 / 수정 / 삭제
- `/requestproduct` : 상품 등록 요청 / 승인 / 거절
- `/inventory` : 입고 / 출고 / 입출고 기록 조회
- `/warehouse` : 창고 CRUD
- `/category` : 카테고리 조회
- `/download` : CSV 다운로드 / 다운로드 기록 조회

## 실행 방법

### 1. 저장소 클론

```bash
git clone <YOUR_REPOSITORY_URL>
cd InvenQR
```

### 2. 백엔드 실행

```bash
cd backend
npm install
```

`.env` 예시:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/invenqr"
JWT_SECRET=your-secret-key
```

Prisma 준비:

```bash
npx prisma generate
npx prisma db push
```

시드 데이터 입력:

```bash
npm run seed:category
```

개발 서버 실행:

```bash
npm run dev
```

### 3. 프론트엔드 실행

```bash
cd ../frontend
npm install
```

`.env` 예시:

```env
VITE_API_URL=http://localhost:5000
```

개발 서버 실행:

```bash
npm run dev
```

## 시드 데이터

### 카테고리

- 전자기기
- PC 부품
- 주변기기
- 네트워크 장비
- 산업 부품
- 공구 / 장비
- 사무용품
- 포장 자재
- 안전 장비
- 기타

### 창고

- 화성창고A (`HW-A`)
- 시흥창고B (`SH-B`)

## 빌드

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
npm run build
```

## 구현 포인트

- React Query 기반으로 API를 기능별로 분리했습니다.
- 사용자 인증 상태는 Redux Toolkit으로 관리합니다.
- 상품 등록 요청과 실제 상품 등록을 분리한 승인 워크플로우를 사용합니다.
- 창고 + 위치 기반으로 재고를 관리합니다.
- 관리자에서 상품 수량 수정 시 입출고 로그도 함께 생성해 이력과 수량이 맞도록 처리합니다.
- CSV 다운로드 이력은 `DownloadLog` 테이블에 저장됩니다.
- 이미지 업로드는 현재 Base64 방식으로 처리됩니다.
- QR 스캔 페이지는 카메라 스캔 / 직접 입력 / 이미지 업로드 방식을 지원합니다.

## 트러블슈팅

### 배포 후 회원가입은 되는데 DB에서 사용자가 안 보이는 경우

- 프론트가 연결한 `VITE_API_URL`과 실제 확인 중인 DB가 같은 환경인지 먼저 확인해야 합니다.
- 배포 프론트와 배포 백엔드가 서로 다른 DB를 보고 있을 수 있습니다.
- Render, Railway, VPS 같은 배포 환경에서는 로컬 `.env`가 아니라 배포 서비스 환경변수가 사용됩니다.

### 이미지 업로드 시 PayloadTooLargeError가 나는 경우

- 현재 Base64 업로드 구조라 이미지 크기가 너무 크면 발생할 수 있습니다.
- 추후 S3 같은 외부 스토리지 방식으로 분리하는 것이 더 적합합니다.

## 향후 개선

- 이미지 업로드를 S3 같은 외부 스토리지로 분리
- 검색 / 필터 / 페이지네이션 고도화
- 테스트 코드 추가
- 배포 환경 헬스체크 및 모니터링 강화
- 관리자 로그 / 감사 추적 기능 강화
- CSV 다운로드 옵션 세분화

## Author

이 프로젝트는 실제 창고 재고관리 업무 흐름을 웹으로 옮기는 것을 목표로 구현한 개인 프로젝트입니다.

---

원한다면 다음 단계로도 확장할 수 있습니다.

- 실제 페이지 스크린샷 추가
- ERD 이미지 버전 추가
- 시연 GIF 추가
- 데모 계정 / 배포 프론트 링크 추가
- 트러블슈팅 회고 섹션 강화
