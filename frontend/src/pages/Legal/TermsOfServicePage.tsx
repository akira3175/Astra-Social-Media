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
import { ArrowBack, Gavel } from "@mui/icons-material"

const TermsOfServicePage: React.FC = () => {
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
            <Gavel color="primary" sx={{ mr: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Điều khoản dịch vụ
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
            <Typography color="text.primary">Điều khoản dịch vụ</Typography>
          </Breadcrumbs>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="body1" paragraph>
            Cập nhật lần cuối: 12/04/2024
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            1. Giới thiệu
          </Typography>
          <Typography variant="body1" paragraph>
            Chào mừng bạn đến với Astra Social. Khi bạn sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều
            khoản này. Vui lòng đọc kỹ.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            2. Sử dụng dịch vụ
          </Typography>
          <Typography variant="body1" paragraph>
            Bạn phải tuân thủ mọi chính sách được cung cấp cho bạn trong phạm vi Dịch vụ. Không được sử dụng Dịch vụ của
            chúng tôi sai mục đích. Chúng tôi có thể tạm ngừng hoặc ngừng cung cấp Dịch vụ cho bạn nếu bạn không tuân
            thủ các điều khoản hoặc chính sách của chúng tôi hoặc nếu chúng tôi đang điều tra hành vi bị nghi ngờ là sai
            phạm.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            3. Tài khoản của bạn
          </Typography>
          <Typography variant="body1" paragraph>
            Để sử dụng một số Dịch vụ của chúng tôi, bạn có thể cần phải tạo tài khoản. Bạn chịu trách nhiệm bảo mật mật
            khẩu tài khoản của mình. Chúng tôi không chịu trách nhiệm cho bất kỳ tổn thất hoặc thiệt hại nào phát sinh
            từ việc bạn không tuân thủ các yêu cầu bảo mật này.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            4. Quyền riêng tư và bản quyền
          </Typography>
          <Typography variant="body1" paragraph>
            Chính sách bảo mật của Astra Social giải thích cách chúng tôi xử lý dữ liệu cá nhân của bạn và bảo vệ quyền
            riêng tư của bạn khi bạn sử dụng Dịch vụ của chúng tôi. Bằng cách sử dụng Dịch vụ của chúng tôi, bạn đồng ý
            rằng Astra Social có thể sử dụng dữ liệu đó theo chính sách bảo mật của chúng tôi.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            5. Nội dung của bạn trong dịch vụ
          </Typography>
          <Typography variant="body1" paragraph>
            Một số Dịch vụ của chúng tôi cho phép bạn tải lên, gửi, lưu trữ hoặc nhận nội dung. Bạn vẫn giữ quyền sở hữu
            trí tuệ mà bạn có đối với nội dung đó. Khi bạn tải lên, gửi, lưu trữ hoặc nhận nội dung đến hoặc thông qua
            Dịch vụ của chúng tôi, bạn cấp cho Astra Social (và các đối tác của chúng tôi) giấy phép toàn cầu để sử
            dụng, lưu trữ, sao chép, sửa đổi, tạo các tác phẩm phái sinh, truyền tải, xuất bản, hiển thị và phân phối
            công khai nội dung đó.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            6. Nội dung bị cấm
          </Typography>
          <Typography variant="body1" paragraph>
            Bạn không được đăng tải các nội dung sau lên nền tảng Astra Social:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Nội dung khiêu dâm, bạo lực hoặc phân biệt chủng tộc" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Nội dung vi phạm bản quyền hoặc quyền sở hữu trí tuệ" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Nội dung quấy rối, đe dọa hoặc bắt nạt người khác" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Thông tin sai lệch hoặc gây hiểu nhầm" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Phần mềm độc hại hoặc mã độc" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            7. Sửa đổi và chấm dứt dịch vụ
          </Typography>
          <Typography variant="body1" paragraph>
            Astra Social liên tục thay đổi và cải tiến Dịch vụ của mình. Chúng tôi có thể thêm hoặc xóa chức năng hoặc
            tính năng, và chúng tôi cũng có thể tạm dừng hoặc ngừng hoàn toàn một Dịch vụ. Bạn có thể ngừng sử dụng Dịch
            vụ của chúng tôi bất kỳ lúc nào, mặc dù chúng tôi sẽ rất tiếc khi bạn rời đi. Astra Social cũng có thể
            ngừng cung cấp Dịch vụ cho bạn hoặc thêm hoặc tạo ra các giới hạn mới đối với Dịch vụ của chúng tôi bất kỳ
            lúc nào.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            8. Trách nhiệm pháp lý
          </Typography>
          <Typography variant="body1" paragraph>
            Khi được pháp luật cho phép, Astra Social và các nhà cung cấp và nhà phân phối của Astra Social sẽ không
            chịu trách nhiệm về các tổn thất lợi nhuận, doanh thu hoặc dữ liệu, tổn thất tài chính hoặc thiệt hại gián
            tiếp, đặc biệt, do hậu quả, mang tính chất răn đe hoặc trừng phạt.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            9. Về các điều khoản này
          </Typography>
          <Typography variant="body1" paragraph>
            Chúng tôi có thể sửa đổi các điều khoản này hoặc bất kỳ điều khoản bổ sung nào áp dụng cho một Dịch vụ để,
            ví dụ, phản ánh những thay đổi của luật pháp hoặc thay đổi đối với Dịch vụ của chúng tôi. Bạn nên xem xét
            các điều khoản thường xuyên. Chúng tôi sẽ đăng thông báo về các sửa đổi đối với các điều khoản này trên
            trang này. Chúng tôi sẽ đăng thông báo về các sửa đổi đối với các điều khoản bổ sung trong Dịch vụ áp dụng.
            Những thay đổi sẽ không áp dụng hồi tố và sẽ có hiệu lực không sớm hơn mười bốn ngày sau khi đăng. Tuy
            nhiên, những thay đổi liên quan đến chức năng mới của một Dịch vụ hoặc những thay đổi được thực hiện vì lý
            do pháp lý sẽ có hiệu lực ngay lập tức. Nếu bạn không đồng ý với các điều khoản đã sửa đổi của một Dịch vụ,
            bạn nên ngừng sử dụng Dịch vụ đó.
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

export default TermsOfServicePage
