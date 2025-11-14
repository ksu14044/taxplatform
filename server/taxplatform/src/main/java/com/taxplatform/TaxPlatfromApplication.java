package com.taxplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController   // ← 메인 클래스도 컨트롤러로 만든다
public class TaxPlatfromApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaxPlatfromApplication.class, args);
    }

    @GetMapping("/hello")
    public String hello() {
        System.out.println(">>> /hello called");
        return "hello from main";
    }
}
