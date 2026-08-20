import { readFileSync, writeFileSync } from "fs";

const path = new URL("../src/data/catalog.json", import.meta.url);
const catalog = JSON.parse(readFileSync(path, "utf8"));

function img(id) {
  const n = ((Number(id) - 1) % 20) + 1;
  return {
    coverImage: `/images/games/${n}.svg`,
    heroImage: `/images/games/${n}.svg`,
    instructionImage: `/images/games/instructions/${n}.svg`,
  };
}

function game(spec) {
  const purposes = spec.purposes;
  return {
    id: spec.id,
    page: spec.page,
    name: spec.name,
    minPlayers: spec.minPlayers ?? 2,
    maxPlayers: spec.maxPlayers ?? 20,
    players: spec.players ?? "2–20 người",
    durationMin: spec.durationMin ?? 10,
    durationMax: spec.durationMax ?? 10,
    duration: spec.duration ?? "10 phút",
    time: spec.time ?? "10 phút",
    context: spec.context,
    contexts: spec.contexts,
    purpose: purposes.join(", "),
    purposes,
    tags: [...purposes],
    searchKeywords: spec.searchKeywords ?? [],
    description: spec.description,
    ...img(spec.id),
    howToPlay: [],
    playerModes: spec.playerModes,
    preparation: spec.preparation,
    preparationRequired: spec.preparationRequired ?? true,
    preparationTime: spec.preparationTime ?? 5,
    rules: spec.rules,
  };
}

const filled = [
  game({
    id: 7,
    page: 11,
    name: "Hai sự thật một lời nói dối",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng", "Nhóm nhỏ"],
    purposes: ["Làm quen", "Phá băng", "Giao tiếp", "Tạo tiếng cười"],
    searchKeywords: ["two truths", "one lie", "sự thật", "nói dối"],
    description: "Mỗi người nói 3 câu về bản thân; nhóm đoán câu nào là lời nói dối.",
    preparation: ["Không bắt buộc đạo cụ. Có thể chuẩn bị giấy ghi câu trả lời nếu muốn."],
    preparationRequired: false,
    preparationTime: 0,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Mỗi người chuẩn bị 2 sự thật và 1 lời nói dối về bản thân.",
          "Lần lượt đọc 3 câu (không tiết lộ câu nào sai).",
          "Người kia đoán câu nói dối; đúng được 1 điểm.",
          "Chơi 2–3 vòng, ai đoán đúng nhiều hơn thắng.",
        ],
        rules: ["Không được hỏi thêm trước khi đoán.", "Câu nói dối phải hợp lý, không quá lộ."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Ngồi vòng tròn; mỗi người chuẩn bị 2 sự thật + 1 lời nói dối.",
          "Một người đọc 3 câu; những người còn lại giơ tay/bỏ phiếu câu nào là giả.",
          "Đoán đúng được điểm; người nói lộ bí mật vui nếu bị đoán trúng.",
          "Đi hết vòng trong khoảng 10 phút.",
        ],
        rules: ["Không tiết lộ đáp án trước khi cả nhóm đoán xong.", "Mỗi người chỉ được 1 phiếu đoán mỗi lượt."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: chơi vòng tròn như trên; có thể chia 2 vòng nếu đông.",
          "Nhóm 10+ người: chia nhóm nhỏ 4–5 người chơi song song, rồi chia sẻ câu thú vị nhất.",
          "Quản trò canh giờ mỗi người khoảng 45–60 giây.",
          "Kết thúc bằng việc mỗi nhóm nêu 1 sự thật bất ngờ đã nghe được.",
        ],
        rules: ["Giữ không khí tôn trọng, không đào sâu chuyện riêng tư nhạy cảm."],
      },
    ],
    rules: ["Giữ không khí tôn trọng, không đào sâu chuyện riêng tư nhạy cảm."],
  }),
  game({
    id: 8,
    page: 12,
    name: "Bingo làm quen",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Campus", "Ngoài trời"],
    purposes: ["Làm quen", "Phá băng", "Tăng tương tác", "Tạo sự thoải mái"],
    searchKeywords: ["bingo", "làm quen", "ô bingo"],
    description: "Người chơi tìm đồng đội khớp các ô mô tả trên phiếu Bingo để hoàn thành hàng/cột.",
    preparation: ["In phiếu Bingo (ô mô tả tính cách/sở thích), bút cho mỗi người."],
    preparationTime: 8,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Mỗi người nhận 1 phiếu Bingo rút gọn (6–9 ô).",
          "Hỏi nhau để tìm ô khớp; ký tên vào ô đúng.",
          "Ai hoàn thành 1 hàng trước thắng, hoặc thi xem ai lấp đầy nhiều ô hơn trong 8 phút.",
        ],
        rules: ["Mỗi ô chỉ được 1 chữ ký của đối phương.", "Phải hỏi thật, không tự ký hộ."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Phát phiếu Bingo 9–12 ô.",
          "Di chuyển hỏi lẫn nhau; mỗi người chỉ ký tối đa 1 ô trên phiếu của người khác.",
          "Ai Bingo (1 hàng/cột/đường chéo) trước hô to và thắng.",
        ],
        rules: ["Không chạy chen; tôn trọng khi hỏi.", "Không ký trùng nhiều ô trên cùng 1 phiếu."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: dùng phiếu 12–16 ô, mục tiêu Bingo 1 hàng.",
          "Nhóm 10+ người: mục tiêu full card hoặc 2 hàng; có thể thêm luật 'không hỏi cùng một người liên tiếp'.",
          "3 người Bingo đầu tiên nhận phần thưởng nhỏ / được giới thiệu trước lớp.",
        ],
        rules: ["Mỗi chữ ký phải kèm câu hỏi ngắn xác nhận ô đó.", "Giữ khoảng cách an toàn khi di chuyển."],
      },
    ],
    rules: ["Mỗi chữ ký phải kèm câu hỏi ngắn xác nhận ô đó."],
  }),
  game({
    id: 9,
    page: 13,
    name: "Chuỗi tên nối tiếp",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng", "Nhóm nhỏ"],
    purposes: ["Làm quen", "Phá băng", "Giao tiếp"],
    searchKeywords: ["name chain", "chuỗi tên", "nhớ tên"],
    description: "Người chơi lần lượt nhắc lại tên những người trước và thêm tên mình để cả nhóm nhớ tên nhanh.",
    preparation: ["Không cần đạo cụ."],
    preparationRequired: false,
    preparationTime: 0,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Người A nói tên + 1 sở thích; người B nhắc lại rồi thêm tên và sở thích của mình.",
          "Đổi chiều: A phải nhắc lại đúng cả hai.",
          "Lặp 3–4 vòng với sở thích khác nhau.",
        ],
        rules: ["Phải nhắc đúng thứ tự trước khi thêm thông tin mới."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Ngồi vòng tròn. Người đầu nói tên; người sau nhắc tất cả tên trước rồi nói tên mình.",
          "Có thể thêm động tác hoặc tính từ đi kèm tên.",
          "Ai quên phải bắt đầu lại chuỗi từ đầu (vui vẻ, không phạt nặng).",
        ],
        rules: ["Không được ghi chú trong lúc chơi.", "Nhóm được nhắc nhẹ bằng chữ cái đầu nếu bí."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: chơi 1 vòng đầy đủ; có thể chia 2 nửa vòng nếu khó nhớ.",
          "Nhóm 10+ người: chia nhóm 5–6 người chơi song song, rồi cử đại diện giới thiệu nhóm bên kia.",
          "Kết thúc bằng việc chỉ ngẫu nhiên 1 người và nhờ người khác gọi đúng tên.",
        ],
        rules: ["Giữ nhịp vừa phải; quản trò hỗ trợ khi ai đó bí."],
      },
    ],
    rules: ["Phải nhắc đúng thứ tự tên trước khi thêm tên mình."],
  }),
  game({
    id: 10,
    page: 14,
    name: "Bóng hỏi đáp nhanh",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Ngoài trời", "Campus"],
    purposes: ["Phá băng", "Tăng tương tác", "Giao tiếp", "Tạo tiếng cười"],
    searchKeywords: ["ball questions", "ném bóng", "hỏi đáp"],
    description: "Người cầm bóng trả lời câu hỏi ngắn rồi chuyền bóng cho người tiếp theo.",
    preparation: ["1 quả bóng mềm hoặc đồ vật mềm để chuyền; bộ câu hỏi gợi ý."],
    preparationTime: 3,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Hai người đứng cách nhau 1–2 m, chuyền bóng mềm.",
          "Người nhận trả lời 1 câu hỏi từ quản trò/đối phương rồi chuyền lại.",
          "Chơi liên tục 8–10 câu.",
        ],
        rules: ["Chuyền nhẹ, không ném mạnh.", "Trả lời tối đa 15–20 giây."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Đứng vòng tròn nhỏ, chuyền bóng theo chiều kim đồng hồ hoặc chỉ định người kế.",
          "Người nhận trả lời câu hỏi rồi chọn người tiếp theo.",
          "Không được chuyền lại ngay cho người vừa chuyền.",
        ],
        rules: ["Không chuyền cho cùng một người 2 lần liên tiếp.", "Câu trả lời phải liên quan câu hỏi."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: 1 vòng tròn; quản trò hô câu hỏi trước khi bóng được chuyền.",
          "Nhóm 10+ người: chia 2 vòng hoặc dùng 2 quả bóng.",
          "Ai làm bóng rơi nhận câu hỏi phụ vui.",
        ],
        rules: ["Ưu tiên bóng mềm; giữ khoảng cách an toàn."],
      },
    ],
    rules: ["Chuyền nhẹ, trả lời ngắn gọn trong 20 giây."],
  }),
  game({
    id: 11,
    page: 15,
    name: "Đứng dậy nếu…",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng", "Campus"],
    purposes: ["Phá băng", "Tìm điểm chung", "Tạo sự thoải mái", "Tăng tương tác"],
    searchKeywords: ["stand up if", "đứng dậy nếu", "common"],
    description: "Quản trò đọc câu 'Đứng dậy nếu…'; ai đúng với mô tả đứng lên để nhóm thấy điểm chung.",
    preparation: ["Danh sách câu 'Đứng dậy nếu…' (sở thích, thói quen, trải nghiệm nhẹ)."],
    preparationTime: 5,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Lần lượt đọc câu 'Đứng dậy/giơ tay nếu…' cho nhau.",
          "Người kia đứng/giơ tay nếu đúng; sau đó hỏi thêm 1 câu làm rõ.",
          "Mỗi người đọc 5 câu.",
        ],
        rules: ["Tránh câu hỏi quá riêng tư hoặc tiêu cực."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "1 người làm quản trò đọc câu; những người khớp đứng lên.",
          "Đổi quản trò sau 4–5 câu.",
          "Sau mỗi câu, 1 người đứng được mời chia sẻ 10 giây.",
        ],
        rules: ["Không ép chia sẻ nếu không muốn.", "Giữ câu hỏi vui và an toàn."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: cả nhóm cùng chơi; quản trò đọc 8–12 câu.",
          "Nhóm 10+ người: thêm luật chạy đổi chỗ với người đang đứng (nếu có không gian).",
          "Kết thúc bằng việc nêu 2 điểm chung phổ biến nhất của nhóm.",
        ],
        rules: ["Di chuyển nhẹ nhàng nếu có đổi chỗ; không xô đẩy."],
      },
    ],
    rules: ["Tránh câu hỏi nhạy cảm; tôn trọng người không muốn chia sẻ."],
  }),
  game({
    id: 12,
    page: 16,
    name: "Vẽ lưng truyền tin",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng", "Nhóm nhỏ"],
    purposes: ["Phá băng", "Tăng tương tác", "Tạo tiếng cười", "Giao tiếp"],
    searchKeywords: ["back drawing", "vẽ lưng", "truyền tin"],
    description: "Người cuối hàng vẽ hình đơn giản lên lưng người trước; tin được truyền tới đầu hàng để đoán.",
    preparation: ["Giấy ghi đáp án/hình mẫu đơn giản (ngôi sao, nhà, mặt cười…); không gian đủ xếp hàng."],
    preparationTime: 5,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Người A nhìn hình mẫu rồi 'vẽ' bằng ngón tay lên lưng/vai người B (hoặc lên giấy sau lưng).",
          "B đoán hình; đổi vai sau mỗi lượt.",
          "Chơi 6–8 hình.",
        ],
        rules: ["Chỉ vẽ vùng lưng/vai đã đồng ý; không dùng lực mạnh."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Xếp hàng dọc; người cuối xem hình và vẽ lên lưng người trước.",
          "Tin truyền tới người đầu hàng; người đầu vẽ ra giấy và công bố.",
          "Đúng thì cả hàng được điểm; đổi vị trí sau mỗi vòng.",
        ],
        rules: ["Không nói hoặc ra hiệu bằng miệng.", "Chỉ được dùng 1 ngón tay."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: 1 hàng; hình đơn giản trước, tăng độ khó dần.",
          "Nhóm 10+ người: chia 2–3 hàng đua tốc độ và độ chính xác.",
          "Hàng đoán đúng nhanh nhất thắng.",
        ],
        rules: ["Tôn trọng không gian cá nhân; ai không muốn tham gia có thể làm giám khảo."],
      },
    ],
    rules: ["Không nói trong lúc truyền tin; chỉ vẽ bằng ngón tay."],
  }),
  game({
    id: 13,
    page: 17,
    name: "Đoán nghề bằng cử chỉ",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng", "Campus"],
    purposes: ["Phá băng", "Tạo tiếng cười", "Tăng tương tác"],
    searchKeywords: ["mime", "đoán nghề", "cử chỉ", "charades"],
    description: "Một người diễn tả nghề nghiệp hoặc hành động bằng cử chỉ; nhóm đoán trong thời gian ngắn.",
    preparation: ["Thẻ nghề/hành động viết sẵn; đồng hồ đếm giờ."],
    preparationTime: 6,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Bốc thẻ; người A diễn trong 45 giây, người B đoán.",
          "Đổi vai; mỗi người diễn 4 thẻ.",
          "Ai đoán đúng nhiều hơn thắng.",
        ],
        rules: ["Không nói, không viết chữ không khí.", "Được dùng cử chỉ và âm thanh không lời."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Chơi vòng: 1 người diễn, những người còn lại đoán.",
          "Ai đoán đúng được điểm và thay phiên diễn thẻ tiếp.",
          "Giới hạn 60 giây mỗi thẻ.",
        ],
        rules: ["Không nói tên nghề trực tiếp.", "Không dùng đạo cụ ngoài cơ thể."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: chia 2 đội; mỗi lượt 1 người diễn cho đội mình đoán.",
          "Nhóm 10+ người: 2–3 đội; cộng điểm theo số thẻ đúng trong 10 phút.",
          "Đội nhiều điểm nhất thắng.",
        ],
        rules: ["Đội đang không diễn phải im lặng, không gợi ý."],
      },
    ],
    rules: ["Không nói lời; chỉ dùng cử chỉ để diễn."],
  }),
  game({
    id: 14,
    page: 18,
    name: "Kể chuyện nối chữ",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng", "Nhóm nhỏ"],
    purposes: ["Giao tiếp", "Tạo tiếng cười", "Phá băng", "Tăng tương tác"],
    searchKeywords: ["story chain", "nối chữ", "kể chuyện"],
    description: "Mỗi người thêm 1–3 từ hoặc 1 câu để tạo thành câu chuyện tập thể.",
    preparation: ["Chủ đề mở đầu (ví dụ: chuyến đi bất ngờ). Có thể ghi chuyện lên bảng."],
    preparationRequired: false,
    preparationTime: 1,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Chọn chủ đề; lần lượt nói thêm 1 câu.",
          "Sau 8–10 lượt, cùng tóm tắt câu chuyện trong 20 giây.",
          "Chơi 2 chủ đề khác nhau.",
        ],
        rules: ["Phải nối tiếp ý trước đó, không nhảy chủ đề đột ngột."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Ngồi vòng tròn; mỗi người thêm tối đa 7 từ.",
          "Đi 2–3 vòng rồi kết thúc câu chuyện có hậu.",
          "Có thể bình chọn câu nối hài nhất.",
        ],
        rules: ["Không phủ nhận nội dung người trước đã xây.", "Giữ nội dung phù hợp không gian chung."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: mỗi người 1 câu ngắn theo vòng.",
          "Nhóm 10+ người: chia nhóm 5 người viết/ kể song song, rồi đọc cho cả lớp.",
          "Quản trò hô 'sang người tiếp theo' để giữ nhịp.",
        ],
        rules: ["Giữ câu chuyện lành mạnh, tôn trọng mọi người."],
      },
    ],
    rules: ["Nối tiếp ý trước; giữ nội dung vui và phù hợp."],
  }),
  game({
    id: 15,
    page: 19,
    name: "Nhịp tay đồng đội",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng", "Campus"],
    purposes: ["Phá băng", "Tăng tương tác", "Khởi động trước khi họp nhóm"],
    searchKeywords: ["clap rhythm", "nhịp tay", "đồng bộ"],
    description: "Nhóm cùng giữ một nhịp vỗ tay/đập chân; người dẫn thay đổi nhịp để cả nhóm bắt kịp.",
    preparation: ["Không gian đứng thoải mái; có thể dùng nhạc nền nhẹ (tuỳ chọn)."],
    preparationRequired: false,
    preparationTime: 0,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Người A tạo nhịp 4 phách; người B bắt chước.",
          "Đổi vai và tăng độ khó (đổi tay-chân).",
          "Chơi 3–4 nhịp khác nhau.",
        ],
        rules: ["Giữ âm lượng vừa phải.", "Không đạp chân quá mạnh."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "1 người dẫn nhịp; cả nhóm làm theo 8 phách.",
          "Sau mỗi chuỗi, đổi người dẫn.",
          "Thêm luật: ai lệch nhịp phải dẫn chuỗi tiếp theo.",
        ],
        rules: ["Nhìn nhau để đồng bộ, không cần nhạc."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: vòng tròn, truyền nhịp theo chiều kim đồng hồ.",
          "Nhóm 10+ người: chia 2 nhóm đua xem nhóm nào giữ nhịp ổn định hơn trong 30 giây.",
          "Kết thúc bằng 1 chuỗi nhịp cả lớp cùng làm.",
        ],
        rules: ["Quản trò có thể đếm 1-2-3-4 để hỗ trợ."],
      },
    ],
    rules: ["Giữ nhịp rõ ràng; ưu tiên đồng bộ hơn tốc độ."],
  }),
  game({
    id: 16,
    page: 20,
    name: "Đổi ghế siêu tốc",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng"],
    purposes: ["Phá băng", "Tạo tiếng cười", "Tăng tương tác", "Khởi động trước khi họp nhóm"],
    searchKeywords: ["musical chairs", "đổi ghế", "siêu tốc"],
    description: "Khi nghe tín hiệu hoặc câu mô tả đúng, người chơi nhanh chóng đổi chỗ ngồi theo luật.",
    preparation: ["Ghế xếp vòng tròn (thiếu 1 ghế nếu chơi kiểu loại); danh sách câu lệnh đổi chỗ."],
    preparationTime: 5,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Đặt 2 ghế cách nhau. Quản trò (hoặc tự hô) câu lệnh như 'đổi chỗ nếu thích trà sữa'.",
          "Hai người đổi chỗ càng nhanh càng tốt; tính giờ 5 lượt.",
          "Ai phản ứng chậm hơn 3 lần phải trả lời 1 câu hỏi vui.",
        ],
        rules: ["Không kéo ghế khỏi người khác.", "Di chuyển cẩn thận."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Xếp ghế vòng; bớt 1 ghế.",
          "Khi hết nhạc/hết câu lệnh, mọi người tìm ghế; người không có ghế đọc câu hỏi cho vòng sau.",
          "Chơi 6–8 vòng.",
        ],
        rules: ["Không đẩy người; chỉ được ngồi ghế trống."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: chơi đổi ghế theo câu 'đổi chỗ nếu…' (không cần bớt ghế).",
          "Nhóm 10+ người: có thể bớt 1–2 ghế hoặc chia 2 vòng chơi.",
          "Sau 8–10 lệnh, ngồi lại và chia sẻ cảm giác năng lượng nhóm.",
        ],
        rules: ["Ưu tiên an toàn; không chạy trong lối hẹp."],
      },
    ],
    rules: ["Không xô đẩy; chỉ ngồi vào ghế trống."],
  }),
  game({
    id: 17,
    page: 21,
    name: "Phỏng vấn 60 giây",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Campus", "Nhóm nhỏ"],
    purposes: ["Làm quen", "Giao tiếp", "Tạo sự thoải mái", "Tăng tương tác"],
    searchKeywords: ["speed interview", "phỏng vấn", "60 giây"],
    description: "Theo cặp, mỗi người có 60 giây hỏi–đáp để tìm hiểu đối phương rồi giới thiệu lại trước nhóm.",
    preparation: ["Đồng hồ/điện thoại bấm giờ; phiếu gợi ý câu hỏi (tuỳ chọn)."],
    preparationTime: 2,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Người A hỏi trong 60 giây; người B trả lời.",
          "Đổi vai thêm 60 giây.",
          "Mỗi người tóm tắt 3 điều vừa học được về đối phương.",
        ],
        rules: ["Không ngắt lời liên tục.", "Câu hỏi mang tính tích cực."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Chia cặp (nếu lẻ thì nhóm 3 luân phiên).",
          "Mỗi cặp phỏng vấn 60–60 giây.",
          "Lần lượt giới thiệu đối phương cho cả nhóm trong 20 giây.",
        ],
        rules: ["Chỉ nói thông tin đối phương đã đồng ý chia sẻ."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: xếp 2 hàng đối diện, mỗi 90 giây đổi người bên phải.",
          "Nhóm 10+ người: 3–4 vòng đổi cặp; cuối cùng mời 4–5 người giới thiệu 'người thú vị vừa gặp'.",
          "Tổng thời gian khoảng 10 phút.",
        ],
        rules: ["Giữ đúng thời gian; quản trò hô chuyển cặp."],
      },
    ],
    rules: ["Tôn trọng thông tin riêng tư; chỉ chia sẻ điều đã được phép."],
  }),
  game({
    id: 18,
    page: 22,
    name: "Bản đồ cảm xúc hôm nay",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng", "Nhóm nhỏ"],
    purposes: ["Tạo sự thoải mái", "Giao tiếp", "Khởi động trước khi họp nhóm"],
    searchKeywords: ["mood map", "cảm xúc", "check-in"],
    description: "Mỗi người chọn một từ/biểu tượng cảm xúc và giải thích ngắn để nhóm khởi động đồng cảm.",
    preparation: ["Thẻ cảm xúc hoặc bảng từ gợi ý (vui, mệt, hào hứng…); bút và giấy nhỏ."],
    preparationTime: 4,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Mỗi người chọn 1 từ cảm xúc và nói lý do trong 30 giây.",
          "Người kia phản hồi bằng 1 câu đồng cảm.",
          "Đổi chủ đề: cảm xúc mong muốn sau buổi họp.",
        ],
        rules: ["Không phán xét cảm xúc của nhau."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Lần lượt check-in cảm xúc + 1 câu lý do.",
          "Nhóm chọn 1 điểm chung để giữ năng lượng buổi họp.",
          "Có thể gắn thẻ cảm xúc lên tường thành 'bản đồ'.",
        ],
        rules: ["Mỗi người tối đa 45 giây.", "Không ép giải thích sâu."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: vòng check-in nhanh.",
          "Nhóm 10+ người: chia nhóm 4–5 người check-in, rồi đại diện báo cáo xu hướng cảm xúc.",
          "Quản trò tóm tắt và chuyển vào nội dung chính.",
        ],
        rules: ["Giữ không gian an toàn; thông tin không bị đem ra ngoài nếu nhóm thỏa thuận."],
      },
    ],
    rules: ["Không phán xét; chia sẻ ở mức thoải mái."],
  }),
  game({
    id: 19,
    page: 23,
    name: "Đếm tập thể không nói",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng", "Campus"],
    purposes: ["Tăng tương tác", "Phá băng", "Khởi động trước khi họp nhóm"],
    searchKeywords: ["silent count", "đếm tập thể", "không nói"],
    description: "Cả nhóm phải đếm lần lượt từ 1 đến N mà không bàn bạc; nếu trùng số thì bắt đầu lại.",
    preparation: ["Không cần đạo cụ. Chọn số đích (ví dụ 10, 15, 20)."],
    preparationRequired: false,
    preparationTime: 0,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Hai người nhìn nhau và đếm xen kẽ đến 20 mà không báo trước ai nói trước.",
          "Nếu trùng nhịp thì cười và bắt đầu lại.",
          "Thử 3 lần, ghi nhận lần tốt nhất.",
        ],
        rules: ["Không ra hiệu bằng tay rõ ràng (tuỳ luật thống nhất trước)."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Mục tiêu đếm đến 15 không trùng.",
          "Ai cũng có thể nói số tiếp theo; trùng thì về 1.",
          "Thành công khi hoàn thành 1 lượt sạch.",
        ],
        rules: ["Không chỉ định người tiếp theo bằng lời."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: đếm đến 20.",
          "Nhóm 10+ người: đếm đến 30 hoặc chia 2 nhóm thi xem nhóm nào về đích trước.",
          "Có thể thêm luật nhắm mắt để tăng độ khó.",
        ],
        rules: ["Giữ im lặng ngoài việc nói số.", "Không chỉ trích khi phải bắt đầu lại."],
      },
    ],
    rules: ["Không bàn bạc chiến thuật giữa các lần thử (hoặc chỉ cho 20 giây nếu muốn dễ hơn)."],
  }),
  game({
    id: 20,
    page: 24,
    name: "Phân loại siêu tốc",
    context: "Ngoài trời",
    contexts: ["Ngoài trời", "Campus", "Trong lớp học"],
    purposes: ["Phá băng", "Tăng tương tác", "Tạo tiếng cười", "Khởi động trước khi họp nhóm"],
    searchKeywords: ["categories", "phân loại", "siêu tốc"],
    description: "Quản trò hô nhóm tiêu chí (ví dụ màu áo, tháng sinh); người chơi nhanh chóng tụ về đúng khu vực.",
    preparation: ["Dán biển tiêu chí ở các góc phòng/sân; danh sách lệnh phân loại."],
    preparationTime: 6,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Đặt 2–3 khu vực đáp án.",
          "Lần lượt làm quản trò hô tiêu chí; người kia chạy tới đúng khu.",
          "Tính số lần đúng trong 8 lệnh.",
        ],
        rules: ["Chỉ chạy khi đã nghe xong lệnh."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Dùng 3–4 góc phòng.",
          "Mỗi lệnh, tất cả chạy về nhóm phù hợp; ai sai giải thích vui 5 giây.",
          "Chơi 8–10 lệnh.",
        ],
        rules: ["Không kéo người khác về góc của mình."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: phân loại theo nhiều tiêu chí tăng dần độ phức tạp.",
          "Nhóm 10+ người: thêm đua 'nhóm nào xếp hàng nhanh hơn trong góc'.",
          "Kết thúc bằng tiêu chí 'tìm người cùng sở thích' và bắt tay làm quen.",
        ],
        rules: ["Giữ lối đi thông thoáng; ưu tiên đi bộ nhanh hơn chạy nếu chật."],
      },
    ],
    rules: ["Di chuyển có kiểm soát; không chen lấn."],
  }),
  game({
    id: 21,
    page: 25,
    name: "Ghép thẻ tìm đôi",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng", "Campus"],
    purposes: ["Làm quen", "Phá băng", "Tăng tương tác", "Tìm điểm chung"],
    searchKeywords: ["pair cards", "ghép thẻ", "tìm đôi"],
    description: "Mỗi người nhận một nửa cặp thẻ (hình/câu); phải hỏi để tìm đúng nửa còn lại.",
    preparation: ["Bộ thẻ ghép đôi (hình giống nhau hoặc câu hỏi–đáp án)."],
    preparationTime: 7,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Trộn 6–8 cặp thẻ úp xuống.",
          "Lật tìm cặp giống memory; vừa chơi vừa hỏi 1 câu làm quen mỗi khi ghép đúng.",
          "Ai ghép nhiều cặp hơn thắng.",
        ],
        rules: ["Mỗi lượt chỉ lật 2 thẻ."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Phát mỗi người 1 thẻ; tìm người cầm thẻ khớp bằng cách hỏi gợi ý (không khoe thẻ ngay).",
          "Khi ghép đúng, cặp đó chia sẻ 1 điểm chung.",
          "Chơi đến khi mọi thẻ được ghép.",
        ],
        rules: ["Không được xem thẻ của người khác trước khi hỏi."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: phát thẻ ngẫu nhiên, tìm đôi trong 3 phút.",
          "Nhóm 10+ người: nhiều bộ thẻ; sau khi ghép, các cặp nhập thành nhóm 4 theo màu thẻ.",
          "Cặp/nhóm xong trước được giới thiệu đầu tiên.",
        ],
        rules: ["Hỏi lịch sự; không giật thẻ từ tay người khác."],
      },
    ],
    rules: ["Tìm đôi bằng giao tiếp, không chạy cướp thẻ."],
  }),
  game({
    id: 22,
    page: 26,
    name: "Vẽ Blind Portrait",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng", "Nhóm nhỏ"],
    purposes: ["Tạo tiếng cười", "Phá băng", "Tăng tương tác"],
    searchKeywords: ["blind portrait", "vẽ mắt nhắm", "chân dung"],
    description: "Người chơi vẽ chân dung đồng đội trong thời gian ngắn rồi đoán chủ nhân bức vẽ.",
    preparation: ["Giấy A4, bút, băng dán để trưng bày tranh."],
    preparationTime: 5,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Mỗi người có 60 giây vẽ đối phương (không tẩy).",
          "Đổi tranh và đoán chi tiết đối phương muốn nhấn mạnh.",
          "Có thể chơi thêm hiệp vẽ bằng tay không thuận.",
        ],
        rules: ["Không chê bai ngoại hình; giữ tinh thần vui."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Ngồi đối diện người cần vẽ; 90 giây mỗi bức.",
          "Úp tranh giữa bàn, lần lượt lật và đoán ai là mẫu.",
          "Bình chọn bức 'biểu cảm nhất'.",
        ],
        rules: ["Không ghi tên lên mặt trước của tranh."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: vẽ người bên trái; trưng bày triển lãm 2 phút.",
          "Nhóm 10+ người: chia bàn 4–5 người; mỗi bàn chọn 1 tranh để giới thiệu.",
          "Kết thúc bằng việc tìm đúng chủ nhân tranh.",
        ],
        rules: ["Tôn trọng; không vẽ chi tiết gây xấu hổ."],
      },
    ],
    rules: ["Giữ thái độ tích cực với mọi bức vẽ."],
  }),
  game({
    id: 23,
    page: 27,
    name: "Giải đấu Oẳn tù tì",
    context: "Ngoài trời",
    contexts: ["Ngoài trời", "Campus", "Trong lớp học"],
    purposes: ["Phá băng", "Tạo tiếng cười", "Tăng tương tác"],
    searchKeywords: ["rock paper scissors", "oẳn tù tì", "giải đấu"],
    description: "Người thua theo người thắng (cheer train) cho đến khi còn một nhà vô địch được cả đoàn cổ vũ.",
    preparation: ["Không gian đủ để di chuyển thành đoàn cổ vũ."],
    preparationRequired: false,
    preparationTime: 0,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Chơi best-of-5 oẳn tù tì.",
          "Thêm luật tự chọn (ví dụ: được dùng biến thể vui nếu cả hai đồng ý).",
          "Người thắng đặt một thử thách vui nhẹ cho hiệp sau.",
        ],
        rules: ["Ra ký hiệu cùng lúc theo nhịp 1-2-3."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Chơi vòng loại: thắng tiến lên, thua cổ vũ người thắng.",
          "Tiếp tục đến khi còn 1 người bất bại trong nhóm.",
        ],
        rules: ["Người thua phải theo cổ vũ, không đứng ngoài."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: tất cả tìm đối thủ gần nhất; thua nhập đoàn thắng.",
          "Nhóm 10+ người: cùng luật; đoàn càng dài càng cười.",
          "Nhà vô địch cuối cùng cúi chào; cả đoàn vỗ tay 5 cái.",
        ],
        rules: ["Không kéo người; di chuyển nhẹ theo đoàn."],
      },
    ],
    rules: ["Ra ký hiệu cùng nhịp; người thua nhập đoàn người thắng."],
  }),
  game({
    id: 24,
    page: 28,
    name: "Zip Zap Zop",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng", "Campus"],
    purposes: ["Phá băng", "Tăng tương tác", "Khởi động trước khi họp nhóm", "Tạo tiếng cười"],
    searchKeywords: ["zip zap zop", "truyền năng lượng"],
    description: "Truyền 'năng lượng' bằng cách chỉ và hô Zip → Zap → Zop theo vòng; sai nhịp thì bắt đầu lại.",
    preparation: ["Không gian đứng vòng tròn."],
    preparationRequired: false,
    preparationTime: 0,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Hai người chỉ nhau và hô luân phiên Zip, Zap, Zop.",
          "Tăng tốc dần; sai thì cười và reset.",
          "Chơi đến khi giữ được 9 lần hô liên tục đúng.",
        ],
        rules: ["Phải vừa chỉ vừa hô."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Đứng vòng tròn; truyền Zip-Zap-Zop cho người bất kỳ (không nhất thiết cạnh bên).",
          "Không được trả lại ngay cho người vừa truyền.",
          "Sai từ/sai thứ tự thì cả nhóm vỗ tay và bắt đầu lại.",
        ],
        rules: ["Giữ eye contact với người nhận."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: 1 vòng tròn tốc độ vừa.",
          "Nhóm 10+ người: chia 2 vòng hoặc thêm từ thứ 4 (ví dụ Boing) để tăng khó.",
          "Mục tiêu: hoàn thành 20 lần truyền không lỗi.",
        ],
        rules: ["Không chỉ xuống đất; luôn chỉ rõ một người."],
      },
    ],
    rules: ["Đúng thứ tự Zip → Zap → Zop; sai thì reset vui vẻ."],
  }),
  game({
    id: 25,
    page: 29,
    name: "Gương soi động tác",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng", "Nhóm nhỏ"],
    purposes: ["Phá băng", "Tăng tương tác", "Tạo tiếng cười", "Tạo sự thoải mái"],
    searchKeywords: ["mirror", "gương soi", "bắt chước"],
    description: "Một người làm 'người thật', người kia là 'gương' bắt chước chậm các động tác.",
    preparation: ["Không gian đứng đối diện; có thể bật nhạc chậm."],
    preparationRequired: false,
    preparationTime: 1,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Người A dẫn động tác chậm trong 45 giây; người B soi gương.",
          "Đổi vai.",
          "Hiệp 3: cả hai cố dẫn đồng thời và tìm nhịp chung.",
        ],
        rules: ["Động tác chậm, không chạm người."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "1 người dẫn, những người còn lại là gương.",
          "Đổi người dẫn mỗi 40 giây.",
          "Thêm luật đoán cảm xúc mà người dẫn đang thể hiện.",
        ],
        rules: ["Giữ khoảng cách an toàn."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: chia cặp chơi đồng thời.",
          "Nhóm 10+ người: sau 2 hiệp, tạo vòng tròn lớn — 1 người dẫn cả nhóm.",
          "Kết thúc bằng động tác chào tập thể.",
        ],
        rules: ["Không ép động tác quá khó hoặc gây đau."],
      },
    ],
    rules: ["Bắt chước chậm và rõ; không chạm vào nhau."],
  }),
  game({
    id: 26,
    page: 30,
    name: "Salad mùa hè (Đổi chỗ theo từ khóa)",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Ngoài trời", "Campus"],
    purposes: ["Phá băng", "Tạo tiếng cười", "Tăng tương tác", "Làm quen"],
    searchKeywords: ["fruit salad", "đổi chỗ", "từ khóa"],
    description: "Mỗi người được gán một từ khóa; khi nghe gọi từ của mình phải đổi chỗ — giống trò Fruit Salad.",
    preparation: ["Ghế vòng tròn thiếu 1 ghế; danh sách từ khóa (trái cây/màu sắc/chủ đề họp)."],
    preparationTime: 5,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Mỗi người chọn 1 từ khóa. Người thứ ba (hoặc điện thoại) hô từ.",
          "Khi nghe từ của mình thì đứng dậy làm động tác quy ước.",
          "Chơi 10 lệnh nhanh.",
        ],
        rules: ["Phản ứng đúng từ khóa của mình."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Gán từ khóa xen kẽ; xếp ghế, bớt 1 ghế.",
          "Người đứng giữa hô từ khóa hoặc 'Salad mùa hè' (tất cả đổi chỗ).",
          "Ai không có ghế ra giữa làm người hô.",
        ],
        rules: ["Không giữ ghế bằng cách chặn người."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: 3–4 từ khóa lặp lại quanh vòng.",
          "Nhóm 10+ người: thêm từ khóa theo chủ đề sự kiện; chơi 8–10 lượt.",
          "Người giữa có thể hỏi câu làm quen trước khi hô lệnh tiếp.",
        ],
        rules: ["Di chuyển an toàn; không kéo ghế."],
      },
    ],
    rules: ["Đổi chỗ nhanh nhưng không xô đẩy."],
  }),
  game({
    id: 27,
    page: 31,
    name: "Nút thắt đồng đội (Human Knot)",
    context: "Ngoài trời",
    contexts: ["Ngoài trời", "Campus", "Trong phòng"],
    purposes: ["Tăng tương tác", "Phá băng", "Khởi động trước khi họp nhóm", "Giao tiếp"],
    searchKeywords: ["human knot", "nút thắt", "đồng đội"],
    description: "Nhóm nắm tay nhau tạo nút thắt rồi phối hợp gỡ mà không buông tay.",
    preparation: ["Không gian trống trên sàn; nhắc trước về giới hạn tiếp xúc thoải mái."],
    preparationTime: 2,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Hai người nắm hai tay bắt chéo và thử xoay người để gỡ về tư thế bình thường.",
          "Lặp với cách nắm khác nhau.",
          "Thêm thử thách đếm ngược 20 giây.",
        ],
        rules: ["Buông tay nếu đau hoặc khó chịu."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Đứng vòng tròn, nắm tay 2 người không đứng cạnh.",
          "Gỡ nút bằng cách bước qua/khoan tay mà không buông.",
          "Ghi thời gian hoàn thành.",
        ],
        rules: ["Giao tiếp bằng lời được phép; không kéo mạnh."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: 1 vòng Human Knot tiêu chuẩn.",
          "Nhóm 10+ người: chia 2 vòng đua thời gian; hoặc 1 vòng lớn nếu đủ chỗ.",
          "Sau khi gỡ xong, chia sẻ 1 chiến thuật đã giúp nhóm.",
        ],
        rules: ["Ưu tiên an toàn khớp tay/vai; ai muốn thoát ra được dừng ngay."],
      },
    ],
    rules: ["Không buông tay trừ khi cần an toàn; không kéo mạnh."],
  }),
  game({
    id: 28,
    page: 32,
    name: "Một từ một câu chuyện",
    context: "Trong lớp học",
    contexts: ["Trong lớp học", "Trong phòng", "Nhóm nhỏ"],
    purposes: ["Giao tiếp", "Tạo tiếng cười", "Phá băng"],
    searchKeywords: ["one word story", "một từ", "câu chuyện"],
    description: "Mỗi người chỉ được nói đúng một từ mỗi lượt để tạo nên câu chuyện hoàn chỉnh.",
    preparation: ["Chủ đề mở đầu; có thể ghi từ lên bảng."],
    preparationRequired: false,
    preparationTime: 1,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Xen kẽ nói 1 từ tạo thành câu.",
          "Sau 40 từ, cùng đặt tiêu đề cho chuyện.",
          "Chơi 2 chủ đề.",
        ],
        rules: ["Chỉ 1 từ mỗi lượt; không giải thích."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Đi vòng theo chiều kim đồng hồ, mỗi người 1 từ.",
          "Khi chuyện đủ dài, người bất kỳ hô 'Hết!' và tóm tắt.",
          "Bình chọn từ bất ngờ nhất.",
        ],
        rules: ["Không bỏ lượt; nếu bí được nói 'rồi' để kết câu."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: 1 vòng lớn.",
          "Nhóm 10+ người: chia nhóm nhỏ thi kể trong 2 phút, rồi đọc cho cả lớp.",
          "Quản trò giữ nhịp bằng cách chỉ người tiếp theo.",
        ],
        rules: ["Giữ nội dung phù hợp không gian chung."],
      },
    ],
    rules: ["Mỗi lượt chỉ một từ; nội dung vui và tôn trọng."],
  }),
  game({
    id: 29,
    page: 33,
    name: "Speed Friending",
    context: "Campus",
    contexts: ["Campus", "Trong lớp học", "Ngoài trời"],
    purposes: ["Làm quen", "Giao tiếp", "Tăng tương tác", "Tạo sự thoải mái"],
    searchKeywords: ["speed friending", "làm quen nhanh", "networking"],
    description: "Xoay vòng gặp gỡ nhanh: mỗi cặp có 90 giây hỏi đáp theo gợi ý rồi đổi người.",
    preparation: ["Hai hàng ghế đối diện; chuông/đồng hồ; phiếu 5 câu hỏi gợi ý."],
    preparationTime: 6,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Dùng phiếu 5 câu hỏi; trả lời xen kẽ trong 3 phút.",
          "Viết 1 điểm chung tìm được.",
          "Đặt mục tiêu 'sẽ hỏi thêm gì ở lần gặp sau'.",
        ],
        rules: ["Mỗi người nói công bằng thời gian."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Luân phiên cặp trong nhóm (2–3 vòng × 90 giây).",
          "Sau cùng, mỗi người giới thiệu 1 điều thú vị về người vừa nói chuyện.",
        ],
        rules: ["Đúng giờ đổi cặp khi có tín hiệu."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: 2 hàng đối diện, mỗi 90 giây hàng A dịch một ghế.",
          "Nhóm 10+ người: 4–5 vòng gặp gỡ; cuối buổi mời chia sẻ 'người tôi muốn hợp tác'.",
          "Tổng thời gian khoảng 10 phút.",
        ],
        rules: ["Giữ câu hỏi tích cực; không kiểm soát hội thoại."],
      },
    ],
    rules: ["Đúng giờ chuyển vòng; tôn trọng người đang nói."],
  }),
  game({
    id: 30,
    page: 34,
    name: "Tìm kho báu gợi ý",
    context: "Campus",
    contexts: ["Campus", "Ngoài trời", "Trong lớp học"],
    purposes: ["Tăng tương tác", "Phá băng", "Tạo tiếng cười", "Khởi động trước khi họp nhóm"],
    searchKeywords: ["scavenger", "kho báu", "gợi ý"],
    description: "Nhóm nhận danh sách gợi ý ngắn và đua nhau tìm đồ vật/người/khoảnh khắc phù hợp trong khu vực an toàn.",
    preparation: ["Phiếu gợi ý (ví dụ: 'thứ màu đỏ', 'chữ cái logo', 'người đang cười'); phạm vi khu vực rõ ràng."],
    preparationTime: 8,
    playerModes: [
      {
        key: "2",
        label: "2 người",
        instructions: [
          "Nhận phiếu 6 gợi ý; trong 8 phút tìm và chụp/ghi lại bằng điện thoại hoặc điểm danh.",
          "Ai hoàn thành nhiều mục hơn thắng.",
          "Chia sẻ 1 món tìm được thú vị nhất.",
        ],
        rules: ["Không vào khu vực cấm; không lấy đồ của người khác."],
      },
      {
        key: "3-4",
        label: "3–4 người",
        instructions: [
          "Chơi theo đội 3–4 người với cùng phiếu.",
          "Phân công người tìm/người ghi nhận.",
          "Đội về trước với đủ bằng chứng thắng.",
        ],
        rules: ["Phải có bằng chứng rõ (ảnh hoặc xác nhận quản trò).", "Giữ thái độ lịch sự với người xung quanh."],
      },
      {
        key: "5+",
        label: "5+ người",
        instructions: [
          "Nhóm 5–10 người: chia 2 đội, phiếu 8–10 gợi ý.",
          "Nhóm 10+ người: 3–4 đội; thêm gợi ý cần hỏi người lạ thân thiện (nếu phù hợp).",
          "Họp mặt lại sau 8–10 phút để chấm điểm.",
        ],
        rules: ["Ưu tiên an toàn và phép lịch sự; không làm phiền lớp học khác."],
      },
    ],
    rules: ["Chỉ tìm trong khu vực cho phép; không lấy tài sản của người khác."],
  }),
];

const keep = catalog.games.filter((g) => Number(g.page) <= 10);
for (let page = 11; page <= 34; page += 1) {
  const id = page - 4;
  if (!filled.some((g) => g.id === id && g.page === page)) {
    throw new Error(`Missing game for page ${page} / id ${id}`);
  }
}

const firstTen = keep.map((g) => ({ id: g.id, page: g.page, name: g.name }));
catalog.games = [...keep, ...filled];
catalog.webs = [];

writeFileSync(path, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

console.log("kept pages 1-10 games:", firstTen);
console.log("total games:", catalog.games.length);
console.log(
  "pages 11-34:",
  catalog.games
    .filter((g) => g.page >= 11)
    .map((g) => `${g.page}:${g.name} modes=${g.playerModes.length}`)
    .join(" | ")
);
console.log(
  "empty how-to:",
  catalog.games.filter((g) => !(g.playerModes?.length || g.howToPlay?.length)).length
);
