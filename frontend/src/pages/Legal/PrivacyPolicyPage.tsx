import type React from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Container,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material"
import { ArrowBack, Security } from "@mui/icons-material"

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1) // Go back to previous page
  }

  return (
    <Box
      sx={{
        minHeight: "80vh",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Security color="primary" sx={{ mr: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Chính sách bảo mật
            </Typography>
          </Box>

          <Breadcrumbs sx={{ mb: 3 }}>
            <Link
              color="inherit"
              href="/"
              onClick={(e) => {
                e.preventDefault()
                navigate("/")
              }}
            >
              Trang chủ
            </Link>
            <Link
              color="inherit"
              href="/register"
              onClick={(e) => {
                e.preventDefault()
                navigate("/register")
              }}
            >
              Đăng ký
            </Link>
            <Typography color="text.primary">Chính sách bảo mật</Typography>
          </Breadcrumbs>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="body1" paragraph>
            Cập nhật lần cuối: 12/04/2024
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            1. Giới thiệu
          </Typography>
          <Typography variant="body1" paragraph>
            Astra Social tôn trọng quyền riêng tư của bạn và cam kết bảo vệ thông tin cá nhân của bạn. Chính sách bảo
            mật này mô tả cách chúng tôi thu thập, sử dụng và chia sẻ thông tin cá nhân của bạn khi bạn sử dụng nền tảng
            Astra Social.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            2. Thông tin chúng tôi thu thập
          </Typography>
          <Typography variant="body1" paragraph>
            Chúng tôi thu thập các loại thông tin sau:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Thông tin tài khoản"
                secondary="Tên, email, mật khẩu, ngày sinh và thông tin liên hệ khác khi bạn đăng ký tài khoản."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Thông tin hồ sơ"
                secondary="Ảnh đại diện, tiểu sử, sở thích và thông tin khác bạn cung cấp trong hồ sơ của mình."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Nội dung người dùng"
                secondary="Bài viết, bình luận, tin nhắn và các nội dung khác bạn tạo trên nền tảng."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Dữ liệu sử dụng"
                secondary="Thông tin về cách bạn tương tác với nền tảng, bao gồm thời gian truy cập, tính năng bạn sử dụng và các trang bạn xem."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Thông tin thiết bị"
                secondary="Địa chỉ IP, loại thiết bị, hệ điều hành, trình duyệt web và thông tin kỹ thuật khác."
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            3. Cách chúng tôi sử dụng thông tin
          </Typography>
          <Typography variant="body1" paragraph>
            Chúng tôi sử dụng thông tin thu thập được để:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Cung cấp, duy trì và cải thiện nền tảng Astra Social" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Tạo và quản lý tài khoản của bạn" />
            </ListItem> 
            <ListItem>
              <ListItemText primary="Cá nhân hóa trải nghiệm của bạn" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Xử lý giao dịch và gửi thông báo liên quan" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Giao tiếp với bạn về cập nhật, thông báo và hỗ trợ" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Phân tích xu hướng sử dụng và cải thiện dịch vụ" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Phát hiện, ngăn chặn và giải quyết các vấn đề kỹ thuật, gian lận hoặc bảo mật" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            4. Chia sẻ thông tin
          </Typography>
          <Typography variant="body1" paragraph>
            Chúng tôi có thể chia sẻ thông tin của bạn trong các trường hợp sau:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Với người dùng khác"
                secondary="Thông tin hồ sơ và nội dung bạn đăng công khai sẽ hiển thị cho người dùng khác theo cài đặt quyền riêng tư của bạn."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Với nhà cung cấp dịch vụ"
                secondary="Chúng tôi làm việc với các bên thứ ba cung cấp dịch vụ như lưu trữ, phân tích và hỗ trợ khách hàng."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Vì lý do pháp lý"
                secondary="Chúng tôi có thể chia sẻ thông tin để tuân thủ nghĩa vụ pháp lý, bảo vệ quyền và an toàn của người dùng, hoặc phòng chống gian lận."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Trong trường hợp chuyển nhượng kinh doanh"
                secondary="Nếu Astra Social tham gia vào việc sáp nhập, mua lại hoặc bán tài sản, thông tin của bạn có thể được chuyển giao."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Với sự đồng ý của bạn"
                secondary="Chúng tôi có thể chia sẻ thông tin của bạn trong các trường hợp khác khi có sự đồng ý của bạn."
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            5. Bảo mật dữ liệu
          </Typography>
          <Typography variant="body1" paragraph>
            Chúng tôi thực hiện các biện pháp bảo mật hợp lý để bảo vệ thông tin cá nhân của bạn khỏi truy cập, sử dụng
            hoặc tiết lộ trái phép. Tuy nhiên, không có phương thức truyền tải qua internet hoặc lưu trữ điện tử nào là
            an toàn 100%. Do đó, mặc dù chúng tôi nỗ lực bảo vệ thông tin cá nhân của bạn, chúng tôi không thể đảm bảo
            an ninh tuyệt đối.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            6. Quyền của bạn
          </Typography>
          <Typography variant="body1" paragraph>
            Tùy thuộc vào khu vực của bạn, bạn có thể có các quyền sau liên quan đến thông tin cá nhân của mình:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Truy cập và nhận bản sao thông tin cá nhân của bạn" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Sửa đổi hoặc cập nhật thông tin không chính xác" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Xóa thông tin cá nhân của bạn" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Hạn chế hoặc phản đối việc xử lý thông tin của bạn" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Nhận thông tin của bạn ở định dạng có thể chuyển giao" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Rút lại sự đồng ý của bạn" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            7. Lưu giữ dữ liệu
          </Typography>
          <Typography variant="body1" paragraph>
            Chúng tôi lưu giữ thông tin cá nhân của bạn miễn là cần thiết để cung cấp dịch vụ và đáp ứng các mục đích
            được nêu trong chính sách này, trừ khi pháp luật yêu cầu hoặc cho phép thời gian lưu giữ lâu hơn.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            8. Trẻ em
          </Typography>
          <Typography variant="body1" paragraph>
            Astra Social không dành cho người dưới 13 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em
            dưới 13 tuổi. Nếu bạn phát hiện rằng con bạn đã cung cấp thông tin cá nhân cho chúng tôi mà không có sự đồng
            ý của bạn, vui lòng liên hệ với chúng tôi.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            9. Thay đổi đối với chính sách này
          </Typography>
          <Typography variant="body1" paragraph>
            Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về những
            thay đổi quan trọng bằng cách đăng thông báo trên nền tảng hoặc gửi email cho bạn. Chúng tôi khuyến khích
            bạn xem xét chính sách này định kỳ.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            10. Liên hệ với chúng tôi
          </Typography>
          <Typography variant="body1" paragraph>
            Nếu bạn có bất kỳ câu hỏi hoặc quan ngại nào về chính sách bảo mật này hoặc cách chúng tôi xử lý thông tin
            cá nhân của bạn, vui lòng liên hệ với chúng tôi qua email: privacy@astrasocial.com.
          </Typography>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleBack}>
              Quay lại
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default PrivacyPolicyPage
